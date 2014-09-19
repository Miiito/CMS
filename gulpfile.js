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
var bourbon = require('node-bourbon');

/**
 * Load gulp plugins
 */
var $ = require('gulp-load-plugins')();

/**
 * Environment
 */
var env = 'dev'; // dev || prod

/**
 * Copy
 */
var copy: {
	localemail: {
		src: 'config/development/common.local.example',
		dest: 'config/development/common.local.php'
	},
	testroot: {
		src: 'tests/codeception.yml.sample',
		dest: 'tests/codeception.yml'
	},
	acceptancehost: {
		src: 'tests/codeception/acceptance.suite.sample',
		dest: 'tests/codeception/acceptance.suite.yml',
	}
};

/**
 * Styles
 */
gulp.task('styles', function() {
	var cssPaths = gp.getCssPaths();
	var isProd = (env === 'prod');
	var streams = cssPaths.map(function(cssPath) {
		return gulp.src(cssPath.sources + '/*.{scss,sass}')
			.pipe($.sass({
				errLogToConsole: true,
				includePaths: bourbon.includePaths
			}))
			.pipe($.if(isProd, $.autoprefixer('last 5 version'), $.combineMediaQueries(), $.csso()))
			.pipe(gulp.dest(isProd ? cssPath.dist : cssPath.dev));
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
			.pipe($.ngmin())
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
	return gulp.src(distPaths, {read: false}).pipe($.clean());
});

/**
 * Compile
 */
gulp.task('compile', ['clean'], function() {
	env = 'prod';
	gulp.start('styles', 'scripts', 'images', 'fonts', 'copy', function(err) {
		if (err === null) {
			console.log('ALL DONE.');
		}
	});
});

/**
 * PHPLint
 * - changedonly
 */
gulp.task('phplint', function() {

});

/**
 * PHPCS
 * Osszes *.php-ra
 */
gulp.task('phpcs', function() {

});

/**
 * PHPCSDiff
 * - phpcschangedonly
 * - phpcswrapper
 * - phpcs
 */
gulp.task('phpcsdiff', function() {

});

/**
 * Copy
 */
// - nem tomoritett kepek atmasolasa
// - grunt copykeep
gulp.task('copy', function() {

});

/**
 * Hooks
 */
// - clean hooks
// - githooks
gulp.task('hooks', function() {

});

/**
 * Watch
 */
gulp.task('watch', ['styles'], function() {
	// Watch .scss files
	gulp.watch(gp.getAllCssPath(), $.batch({timeout: 250}, function() {
		gulp.start('styles');
	}));
});