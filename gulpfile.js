/* jshint node: true */
'use strict';

/**
 * Requires
 */
var path = require('path');
var gulp = require('gulp');
var es = require('event-stream');
var gp = require('get-packages').init({
    applicationPath: '.',
    yiiPackagesCommand: 'yii packages'
});
// var browserSync = require('browser-sync'); // (npm install --save-dev browser-sync)

/**
 * Load gulp plugins
 */
var $ = require('gulp-load-plugins')();

/**
 * Config
 * @type {Object}
 */
var config = require('./gulpconfig.json');

/**
 * Error reporter
 */
var errorReporter = function() {
    return es.map(function(file, cb) {
        if (!file.jshint.success) {
            process.exit(1);
        }
        cb(null, file);
    });
};

/**
 * Styles
 * @param {Boolean} isProd
 */
var styles = function(isProd) {
    var cssPaths = gp.getCssPaths();
    var streams = cssPaths.map(function(cssPath) {
        var dest = isProd ? cssPath.dist : cssPath.dev;
        return gulp.src(path.join(cssPath.sources, '*.{scss,sass}'))
            .pipe($.changed(dest))
            // Libsass
            .pipe($.sass({
                // includePaths: require('node-bourbon').includePaths, // include bourbon (npm install node-bourbon --save-dev)
                errLogToConsole: true
            }))
            // Rubysass (npm install --save-dev gulp-ruby-sass)
            // .pipe($.plumber()) // (npm install --save-dev gulp-plumber)
            // .pipe($.rubySass({
            //  // loadPath: require('node-bourbon').includePaths, // include bourbon (npm install node-bourbon --save-dev)
            //  style: 'expanded',
            //  precision: 10,
            //  container: '~/tmp'
            // }))
            .pipe($.if(isProd, $.autoprefixer({
                browsers: ['last 3 version'],
                cascade: false
            })))
            .pipe($.if(isProd, $.csso()))
            .pipe($.rename({dirname: '.'}))
            .pipe(gulp.dest(dest))
            .pipe($.if(!isProd, $.livereload(config.port)));
            // .pipe(browserSync.reload({stream: true}));
    });
    return es.merge.apply(null, streams);
};

/**
 * Setup
 */
var setup = function(environment, apachegrp, email) {
    gulp.src('')
        .pipe($.shell(['php setup.php ' + environment + ' ' + apachegrp]));

    gulp.src(config.copykeep.localemail.src)
        .pipe($.rename(config.copykeep.localemail.destFile))
        .pipe($.replace(/'as dryrun' => \[(\s*)'email'\s*=>\s*'[^']*'/, '\'as dryrun\' => [ \'email\' => \'' + email + '\' '))
        .pipe(gulp.dest(config.copykeep.localemail.destPath));
};

/**
 * Setup testroot
 */
var setupTestroot = function(testroot) {
    gulp.src(config.copykeep.testroot.src)
        .pipe($.rename(config.copykeep.testroot.destFile))
        .pipe($.replace(/c3url:.*/, 'c3url: /' + testroot.replace(/^(\/)|(\/)$/g, '') + '/testweb/index-test.php'))
        .pipe($.replace(/test_entry_url:.*/, 'test_entry_url: /' + testroot.replace(/^(\/)|(\/)$/g, '') + '/testweb/index-test.php'))
        .pipe(gulp.dest(config.copykeep.testroot.destPath));

    gulp.src(config.copykeep.acceptancehost.src)
        .pipe($.rename(config.copykeep.acceptancehost.destFile))
        .pipe(gulp.dest(config.copykeep.acceptancehost.destPath));
};

/**
 * Styles src
 */
gulp.task('styles:src', function() {
    return styles(false);
});

/**
 * Styles dist
 */
gulp.task('styles:dist', function() {
    return styles(true);
});

/**
 * JSHint
 */
gulp.task('jshint', function() {
    return gulp.src(gp.getAllJsFile())
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(errorReporter());
});

/**
 * JSCS
 */
gulp.task('jscs', function() {
    return gulp.src(gp.getAllJsFile())
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
            // .pipe($.ngAnnotate()) // ng-annotate (npm install --save-dev gulp-ng-annotate)
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
        return gulp.src(path.join(imagePath.sources, '**', '*.{png,jpg,jpeg,gif}'))
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
        return gulp.src(path.join(fontPath.sources, '**', '*.{woff,ttf,svg,eot}'))
            .pipe(gulp.dest(fontPath.dest));
    });
    return es.merge.apply(null, streams);
});

/**
 * Clean
 */
gulp.task('clean', function(cb) {
    var del = require('del');
    del(gp.getAllDistPath(), cb);
});

/**
 * Compile
 */
gulp.task('compile', ['clean'], function() {
    gulp.start('styles:dist', 'scripts', 'images', 'fonts', 'copy-non-images');
});

/**
 * Build
 */
gulp.task('build', function() {
    gulp.start('compile');
});

/**
 * Copy non images
 */
gulp.task('copy-non-images', function() {
    var imagePaths = gp.getImagePaths();
    var streams = imagePaths.map(function(imagePath) {
        return gulp.src(path.join(imagePath.sources, '**', '!(*.png|*.jpg|*.jpeg|*.gif)'))
            .pipe(gulp.dest(imagePath.dest));
    });
    return es.merge.apply(null, streams);
});

/**
 * PHPLint
 */
gulp.task('phplint', function() {
    var fileList = require('execSync').exec('git diff-index --cached --name-only --diff-filter=ACMR HEAD').stdout.split('\n');
    var phplint = require('phplint');

    fileList = fileList.filter(function(file) {
        return path.extname(file) === '.php';
    });

    var stream = phplint(fileList);
    stream.fail(function(err) {
        process.exit(1);
    });

    return stream;
});

/**
 * PHPCS
 */
gulp.task('phpcs', function() {
    gulp.start('phpcs:application', 'phpcs:views', 'phpcs:others');
});

/**
 * PHPCS application
 */
gulp.task('phpcs:application', function() {
    return gulp.src(config.phpcs.application.dir)
        .pipe($.phpcs({
            bin: config.phpcs.options.bin,
            standard: config.phpcs.application.standard
        }))
        .pipe($.phpcs.reporter('log'));
});

/**
 * PHPCS views
 */
gulp.task('phpcs:views', function() {
    return gulp.src(config.phpcs.views.dir)
        .pipe($.phpcs({
            bin: config.phpcs.options.bin,
            standard: config.phpcs.views.standard
        }))
        .pipe($.phpcs.reporter('log'));
});

/**
 * PHPCS others
 */
gulp.task('phpcs:others', function() {
    return gulp.src(config.phpcs.others.dir)
        .pipe($.phpcs({
            bin: config.phpcs.options.bin,
            standard: config.phpcs.others.standard
        }))
        .pipe($.phpcs.reporter('log'));
});

/**
 * PHPCSDiff
 */
gulp.task('phpcsdiff', function() {
    var fileList = require('execSync').exec('git diff-index --name-only --diff-filter=ACMR HEAD').stdout.split('\n');
    fileList = gp.util.match(fileList, config.phpcs.application.dir);

    return gulp.src(fileList)
        .pipe($.phpcs({
            bin: config.phpcs.options.bin,
            standard: config.phpcs.application.standard
        }))
        .pipe($.phpcs.reporter('log'));
});

/**
 * Setup
 */
gulp.task('setup', function() {
    var argv = require('yargs').argv;
    var apachegrp = argv.apachegrp || config.apachegrp;

    if (typeof argv.environment === 'string' &&
        typeof argv.email === 'string') {
        setup(argv.environment, apachegrp, argv.email);
    } else {
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
            }, {
                type: 'input',
                name: 'email',
                message: 'Your email',
                validate: function(value) {
                    if (value === '') {
                        return 'Please enter an email address';
                    }
                    return true;
                }
            }], function(res) {
                setup(res.environment, apachegrp, res.email);
            }));
    }
});

/**
 * Setup testroot
 */
gulp.task('setup:testroot', function() {
    var argv = require('yargs').argv;

    if (typeof argv.testroot === 'string') {
        setupTestroot(argv.testroot);
    } else {
        return gulp.src('')
            .pipe($.prompt.prompt({
                type: 'input',
                name: 'testroot',
                message: 'Base URL of this app (e.g. "/me/yii2/basic")'
            }, function(res) {
                setupTestroot(res.testroot);
            }));
    }
});

/**
 * Findport
 */
gulp.task('findport', function(cb) {
    var lrPortFilepath = '.lrport';
    var fs = require('fs');
    var chalk = require('chalk');
    var portfinder = require('portfinder');

    var basePort = null;
    if (fs.existsSync(lrPortFilepath)) {
        basePort = parseInt(fs.readFileSync(lrPortFilepath), 10);
    }

    if (basePort === null) {
        basePort = 35729 + Math.floor((Math.random() * 10000) + 1);
    }

    portfinder.basePort = basePort;

    portfinder.getPort(function(err, port) {
        if (err === null) {
            config.port = port;
            console.log(chalk.gray('----------------------------------------'));
            console.log('Found port: ' + chalk.green(port));
            console.log('Command: ' + chalk.yellow('ssh -L 35729:localhost:' + port + ' ' + require('os').hostname()));
            console.log(chalk.gray('----------------------------------------'));
            fs.writeFileSync(lrPortFilepath, port);
        } else {
            console.log(chalk.red('Failed to find port.'));
        }
        cb();
    });
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
    var fs = require('fs');
    if (!fs.existsSync(path.join('config', 'ENV'))) {
        gulp.start('hooks', 'setup');
    }
});

/**
 * Clean hooks
 */
gulp.task('clean:hooks', function(cb) {
    var del = require('del');
    del(['.git/hooks/pre-commit'], cb);
});

/**
 * Hooks
 */
gulp.task('hooks', ['clean:hooks'], function() {
    return gulp.src('hooks/staged')
        .pipe($.replace('{{gulpfileDirectory}}', __dirname))
        .pipe($.rename('pre-commit'))
        .pipe($.chmod(755))
        .pipe(gulp.dest('.git/hooks/'));
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
                'jshint',
                'jscs',
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
//  browserSync({
//      proxy: 'playground',
//      port: 8301,
//      open: false
//  });
// });

/**
 * Reload all browsers
 */
// gulp.task('bs-reload', function() {
//  browserSync.reload();
// });

/**
 * Watch
 */
gulp.task('watch', ['findport'], function() {
    gulp.start('styles:src'/*, 'browser-sync'*/, function() {
        // Watch .js files
        // $.saneWatch(gp.getAllJsFile(), function() {
        //  browserSync.reload();
        // });

        // Watch .scss files
        $.saneWatch(gp.getAllCssPath(), function() {
            gulp.start('styles:src');
        });
    });
});
