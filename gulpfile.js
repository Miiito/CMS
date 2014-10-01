'use strict';

/**
 * Requires
 */
var gulp = require('gulp');
var es = require('event-stream');
var gp = require('get-packages').init({
	applicationPath: '.',
	yiiPackagesCommand: 'yii packages'
});
// var browserSync = require('browser-sync');

/**
 * Load gulp plugins
 */
var $ = require('gulp-load-plugins')();

/**
 * Defaults
 * @type {Object}
 */
var defaults = {
	environment: 'dev', // dev || prod
	apachegrp: '',
	copykeep: {
		localemail: {
			src: 'config/development/common.local.example',
			destPath: 'config/development',
			destFile: 'common.local.php'
		},
		testroot: {
			src: 'tests/codeception.yml.sample',
			destPath: 'tests',
			destFile: 'codeception.yml'
		},
		acceptancehost: {
			src: 'tests/codeception/acceptance.suite.sample',
			destPath: 'tests/codeception',
			destFile: 'acceptance.suite.yml'
		}
	},
	phpcs: {
		application: {
			dir: [
				'components/**/*.php',
				'modules/**/*.php',
				'!modules/*/views/*/*',
				'!modules/*/migrations/*',
				'assets/**/*.php',
				'controllers/**/*.php',
				'commands/**/*.php',
				'models/**/*.php',
				'widgets/*.php',
				'!widgets/views/*'
			],
			standard: 'vendor/yiisoft/yii2-coding-standards/Yii2'
		},
		views: {
			dir: [
				'views/**/*.php',
				'mail/**/*.php',
				'modules/*/views/*/*',
				'modules/*/mail/*/*'
			],
			standard: 'vendor/mito/yii2-coding-standards/Views'
		},
		others: {
			dir: [
				'config/**/*.php',
				'setup.php',
				'migrations/**/*.php',
				'modules/*/migrations/*.php'
			],
			standard: 'vendor/mito/yii2-coding-standards/Yii2'
		},
		options: {
			bin: 'vendor/bin/phpcs'
		}
	}
};

/**
 * Styles
 */
gulp.task('styles', function() {
	var cssPaths = gp.getCssPaths();
	var isProd = (defaults.environment === 'prod');
	var streams = cssPaths.map(function(cssPath) {
		return gulp.src(cssPath.sources + '/*.{scss,sass}')
			// Libsass
			.pipe($.sass({
				// includePaths: require('node-bourbon').includePaths, // include bourbon
				errLogToConsole: true
			}))
			// Rubysass
			// .pipe($.plumber())
			// .pipe($.rubySass({
			// 	// loadPath: require('node-bourbon').includePaths, // include bourbon
			// 	style: 'expanded',
			// 	precision: 10,
			// 	container: '~/tmp'
			// }))
			.pipe($.if(isProd, $.autoprefixer({
				browsers: ['last 3 version'],
				cascade: false
			}), $.combineMediaQueries(), $.csso()))
			.pipe(gulp.dest(isProd ? cssPath.dist : cssPath.dev));
			// .pipe(browserSync.reload({stream: true}));
	});
	return es.merge.apply(null, streams);
});

/**
 * Scripts hint/lint
 */
gulp.task('jslint', function() {
	var allJsFile = gp.getAllJsFile();
	return gulp.src(allJsFile)
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('jshint-stylish'))
		.pipe($.jscs('.jscsrc'));
});

/**
 * Scripts
 */
gulp.task('scripts', function() {
	var buildJs = gp.getBuildJs();
	var streams = buildJs.map(function(jsFile) {
		return gulp.src(jsFile.sources)
			.pipe($.concat(jsFile.concatFilename))
			// .pipe($.ngmin()) // angularjs ngmin
			.pipe($.uglify())
			.pipe(gulp.dest(jsFile.dest));
	});
	return es.merge.apply(null, streams);
});

/**
 * Images
 */
gulp.task('images', function() {
	var imagePaths = gp.getImagePaths();
	var streams = imagePaths.map(function(imagePath) {
		return gulp.src(imagePath.sources + '/**/*.{png,jpg,jpeg,gif}')
			.pipe($.imagemin({
				optimizationLevel: 3,
				progressive: true,
				interlaced: true
			}))
			.pipe(gulp.dest(imagePath.dest));
	});
	return es.merge.apply(null, streams);
});

/**
 * Fonts
 */
gulp.task('fonts', function() {
	var fontPaths = gp.getFontPaths();
	var streams = fontPaths.map(function(fontPath) {
		return gulp.src(fontPath.sources + '/**/*.{woff,ttf,svg,eot}')
			.pipe(gulp.dest(fontPath.dest));
	});
	return es.merge.apply(null, streams);
});

/**
 * Clean
 */
gulp.task('clean', function() {
	var distPaths = gp.getAllDistPath();
	return gulp.src(distPaths, {read: false}).pipe($.rimraf());
});

/**
 * Compile
 */
gulp.task('compile', ['clean'], function() {
	defaults.environment = 'prod';
	gulp.start('styles', 'scripts', 'images', 'fonts', 'copy-non-images');
});

/**
 * Copy non images
 */
gulp.task('copy-non-images', function() {
	var imagePaths = gp.getImagePaths();
	var streams = imagePaths.map(function(imagePath) {
		return gulp.src(imagePath.sources + '/**/!(*.png|*.jpg|*.jpeg|*.gif)')
			.pipe(gulp.dest(imagePath.dest));
	});
	return es.merge.apply(null, streams);
});

/**
 * PHPLint
 */
gulp.task('phplint', function() {
	var path = require('path');
	var fileList = require('execSync').exec('git diff-index --cached --name-only --diff-filter=ACMR HEAD').stdout.split('\n');
	var phplint = require('phplint');

	fileList = fileList.filter(function(file) {
		return path.extname(file) === '.php';
	});

	return phplint(fileList);
});

/**
 * PHPCS
 */
gulp.task('phpcs', function() {
	var streams = [];

	// Application
	streams.push(gulp.src(defaults.phpcs.application.dir)
		.pipe($.phpcs({
			bin: defaults.phpcs.options.bin,
			standard: defaults.phpcs.application.standard
		}))
		.pipe($.phpcs.reporter('log')));

	// Views
	streams.push(gulp.src(defaults.phpcs.views.dir)
		.pipe($.phpcs({
			bin: defaults.phpcs.options.bin,
			standard: defaults.phpcs.views.standard
		}))
		.pipe($.phpcs.reporter('log')));

	// Others
	streams.push(gulp.src(defaults.phpcs.others.dir)
		.pipe($.phpcs({
			bin: defaults.phpcs.options.bin,
			standard: defaults.phpcs.others.standard
		}))
		.pipe($.phpcs.reporter('log')));

	return es.merge.apply(null, streams);
});

/**
 * PHPCSDiff
 */
gulp.task('phpcsdiff', function() {
	var fileList = require('execSync').exec('git diff-index --name-only --diff-filter=ACMR HEAD').stdout.split('\n');
	fileList = gp.util.match(fileList, defaults.phpcs.application.dir);

	return gulp.src(fileList)
		.pipe($.defaults.phpcs({
			bin: defaults.phpcs.options.bin,
			standard: defaults.phpcs.application.standard
		}))
		.pipe($.defaults.phpcs.reporter('log'));
});

/**
 * Setup
 */
gulp.task('setup', function() {
	return gulp.src('')
		.pipe($.prompt.prompt([{
			type: 'list',
			name: 'environment',
			message: 'Select environment',
			choices: ['development', 'staging', 'production', 'other']
		}, {
			type: 'input',
			name: 'environment',
			message: 'Type custom environment',
			when: function(res) {
				if (res.environment === 'other') {
					return true;
				}
				return false;
			}
		}], function(res) {
			gulp.src('')
				.pipe($.shell(['php setup.php ' + res.environment + ' ' + defaults.apachegrp]));
		}));
});

/**
 * Setup testroot
 */
gulp.task('setup:testroot', function() {
	return gulp.src('')
		.pipe($.prompt.prompt({
			type: 'input',
			name: 'testroot',
			message: 'Base URL of this app (e.g. "/me/yii2/basic")'
		}, function(res) {
			gulp.src(defaults.copykeep.testroot.src)
				.pipe($.rename(defaults.copykeep.testroot.destFile))
				.pipe($.replace(/c3url:.*/, 'c3url: /' + res.testroot.replace(/^(\/)|(\/)$/g, '') + '/testweb/index-test.php'))
				.pipe($.replace(/test_entry_url:.*/, 'test_entry_url: /' + res.testroot.replace(/^(\/)|(\/)$/g, '') + '/testweb/index-test.php'))
				.pipe(gulp.dest(defaults.copykeep.testroot.destPath));

			gulp.src(defaults.copykeep.acceptancehost.src)
				.pipe($.rename(defaults.copykeep.acceptancehost.destFile))
				.pipe(gulp.dest(defaults.copykeep.acceptancehost.destPath));
		}));
});

/**
 * Setup local email
 */
gulp.task('setup:localemail', function() {
	return gulp.src('')
		.pipe($.prompt.prompt({
			type: 'input',
			name: 'email',
			message: 'Your email',
			validate: function(value) {
				if (value === '') {
					return 'Please enter an email address';
				}
				return true;
			}
		}, function(res) {
			gulp.src(defaults.copykeep.localemail.src)
				.pipe($.rename(defaults.copykeep.localemail.destFile))
				.pipe($.replace(/'as dryrun' => \[(\s*)'email'\s*=>\s*'[^']*'/, '\'as dryrun\' => [ \'email\' => \'' + res.email + '\' '))
				.pipe(gulp.dest(defaults.copykeep.localemail.destPath));
		}));
});

/**
 * Codecept build
 */
gulp.task('codeceptbuild', $.shell.task('../vendor/bin/codecept build', {
	cwd: 'tests'
}));

/**
 * Codeception
 */
gulp.task('codeception', $.shell.task('../vendor/bin/codecept run --coverage --html --coverage-html', {
	cwd: 'tests'
}));

/**
 * Test
 */
gulp.task('test', ['codeceptbuild'], function() {
	gulp.start('codeception');
});

/**
 * Post install
 */
gulp.task('postinstall', function() {
	gulp.start('hooks', 'setup', 'setup:localemail');
});

/**
 * Hooks
 */
// - githooks
gulp.task('hooks', function() {
	var streams = [];
	streams.push(gulp.src('.git/hooks/pre-commit', {read: false})
		.pipe($.rimraf()));
});

/**
 * Commit
 */
gulp.task('commit', function() {
	gulp.start('phplint', 'jshint');
});

/**
 * Default
 */
gulp.task('default', function() {
	return gulp.src('')
		.pipe($.prompt.prompt({
			type: 'list',
			name: 'task',
			message: 'Select task',
			choices: [
				'watch',
				'setup',
				'phpcs',
				'jslint',
				'compile'
			]
		}, function(res) {
			gulp.start(res.task);
		}));
});

/**
 * Browser sync
 */
// gulp.task('browser-sync', function() {
// 	browserSync({
// 		proxy: 'playground',
// 		port: 8301,
// 		open: false
// 	});
// });

/**
 * Reload all browsers
 */
// gulp.task('bs-reload', function() {
// 	browserSync.reload();
// });

/**
 * Watch
 */
gulp.task('watch', ['styles'/*, 'browser-sync'*/], function() {
	// Watch .js files
	// gulp.watch(gp.getAllJsFile(), browserSync.reload);

	// Watch .scss files
	gulp.watch(gp.getAllCssPath(), $.batch({timeout: 250}, function() {
		gulp.start('styles');
	}));
});
