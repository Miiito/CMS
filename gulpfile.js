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
 * Styles
 * @param {Boolean} isProd
 * @param {String}  changedFile
 */
var styles = function(isProd, changedFile) {
    var stylesPaths = gp.getStylesPathsByFilepath(changedFile);
    var streams = stylesPaths.map(function(stylePaths) {
        var dest = isProd ? stylePaths.dist : stylePaths.dev;
        return gulp.src(path.join(stylePaths.sources, '*.{scss,sass}'))
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
    });
    return es.merge.apply(null, streams);
};

/**
 * Get setup source
 * @param  {Object} obj
 * @return {String}
 */
var getSetupSource = function(obj) {
    var fs = require('fs');
    var src = obj.src;
    var destFullPath = path.join(obj.destPath, obj.destFile);
    var isExists = fs.existsSync(destFullPath);

    if (isExists) {
        src = destFullPath;
    }

    return src;
};

/**
 * Setup
 * @param {String} environment
 * @param {String} apachegrp
 * @param {String} email
 */
var setup = function(environment, apachegrp, email) {
    gulp.src('')
        .pipe($.shell(['php setup.php ' + environment + ' ' + apachegrp]));

    gulp.src(getSetupSource(config.copykeep.localemail))
        .pipe($.rename(config.copykeep.localemail.destFile))
        .pipe($.replace(/'as dryrun' => \[(\s*)'email'\s*=>\s*'[^']*'/, '\'as dryrun\' => [ \'email\' => \'' + email + '\' '))
        .pipe(gulp.dest(config.copykeep.localemail.destPath));
};

/**
 * Setup testroot
 * @param {String} testroot
 */
var setupTestroot = function(testroot) {
    gulp.src(getSetupSource(config.copykeep.testroot))
        .pipe($.rename(config.copykeep.testroot.destFile))
        .pipe($.replace(/c3url:.*/, 'c3url: /' + testroot.replace(/^(\/)|(\/)$/g, '') + '/testweb/index-test.php'))
        .pipe($.replace(/test_entry_url:.*/, 'test_entry_url: /' + testroot.replace(/^(\/)|(\/)$/g, '') + '/testweb/index-test.php'))
        .pipe(gulp.dest(config.copykeep.testroot.destPath));

    gulp.src(getSetupSource(config.copykeep.acceptancehost))
        .pipe($.rename(config.copykeep.acceptancehost.destFile))
        .pipe(gulp.dest(config.copykeep.acceptancehost.destPath));

    gulp.src(getSetupSource(config.copykeep.mochaconfig))
        .pipe($.rename(config.copykeep.mochaconfig.destFile))
        .pipe($.replace(/"path":.*?(,\s*$|$)/m, '"path": "/' + testroot.replace(/^(\/)|(\/)$/g, '') + '/tests/web/index-test.php"$1'))
        .pipe(gulp.dest(config.copykeep.mochaconfig.destPath));
};

/**
 * Styles src with finport
 */
gulp.task('styles:findport', ['findport'], function() {
    return styles(false);
});

/**
 * Styles dist
 */
gulp.task('styles:dist', ['clean'], function() {
    return styles(true);
});

/**
 * JSHint
 */
gulp.task('jshint', ['jshint:hinting'], function(cb) {
    if (config.jshintExitCode) {
        cb({
            showStack: false,
            toString: function() {
                return 'Jshint error';
            }
        });
    } else {
        cb();
    }
});

/**
 * JSHint hinting
 */
gulp.task('jshint:hinting', function() {
    config.jshintExitCode = 0;

    var errorReporter = function() {
        return es.map(function(file, cb) {
            if (!file.jshint.success) {
                config.jshintExitCode = 1;
            }
            cb(null, file);
        });
    };

    return gulp.src(gp.getScriptsSourcePath())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(errorReporter());
});

/**
 * JSCS
 */
gulp.task('jscs', function() {
    return gulp.src(gp.getScriptsSourcePath(), {base: process.cwd()})
        .pipe($.jscs('.jscsrc'));
});

/**
 * JSCSDiff
 */
gulp.task('jscsdiff', function() {
    var fileList = require('execSync').exec('git diff-index --name-only --diff-filter=ACMR HEAD').stdout.split('\n');

    fileList = fileList.map(function(file) {
        return path.resolve(file);
    });

    fileList = gp.util.match(fileList, gp.getScriptsSourcePath());

    return gulp.src(fileList, {base: process.cwd()})
        .pipe($.jscs('.jscsrc'));
});

/**
 * Scripts
 */
gulp.task('scripts', ['clean', 'jshint'], function() {
    var scriptsToBuild = gp.getScriptsToBuild();
    var streams = scriptsToBuild.map(function(scriptPaths) {
        return gulp.src(scriptPaths.sources)
            .pipe($.concat(scriptPaths.concatFilename))
            // .pipe($.ngAnnotate()) // ng-annotate (npm install --save-dev gulp-ng-annotate)
            .pipe($.uglify())
            .pipe(gulp.dest(scriptPaths.dest));
    });
    return es.merge.apply(null, streams);
});

/**
 * Images
 */
gulp.task('images', ['clean'], function() {
    var imagesPaths = gp.getImagesPaths();
    var streams = imagesPaths.map(function(imagePaths) {
        return gulp.src(path.join(imagePaths.sources, '**', '*.{png,jpg,jpeg,gif}'))
            .pipe($.changed(imagePaths.dest))
            .pipe($.imagemin({
                optimizationLevel: 3,
                progressive: true,
                interlaced: true
            }))
            .pipe(gulp.dest(imagePaths.dest));
    });
    return es.merge.apply(null, streams);
});

/**
 * Fonts
 */
gulp.task('fonts', ['clean'], function() {
    var fontsPaths = gp.getFontsPaths();
    var streams = fontsPaths.map(function(fontPaths) {
        return gulp.src(path.join(fontPaths.sources, '**', '*.{woff,ttf,svg,eot}'))
            .pipe(gulp.dest(fontPaths.dest));
    });
    return es.merge.apply(null, streams);
});

/**
 * Clean without images
 */
gulp.task('clean:without-images', function(cb) {
    var del = require('del');
    del(gp.getPackagesDistPathWithoutImageDir(), cb);
});

/**
 * Clean
 */
gulp.task('clean', ['clean:without-images'], function() {
    var fs = require('fs');
    var imagesPaths = gp.getImagesPaths();
    var streams = imagesPaths.map(function(imagePaths) {
        return gulp.src(path.join(imagePaths.dest, '**', '*'))
            .pipe($.changed(imagePaths.sources, {
                hasChanged: function(stream, cb, sourceFile, targetPath) {
                    if (!fs.existsSync(targetPath)) {
                        stream.push(sourceFile);
                    }
                    cb();
                }
            }))
            .pipe((function() {
                function remove(file, cb) {
                    if (!fs.statSync(file.path).isDirectory()) {
                        fs.unlinkSync(file.path);
                    }
                    cb(null);
                }
                return es.map(remove);
            })());
    });
});

/**
 * Compile
 */
gulp.task('compile', ['styles:dist', 'scripts', 'images', 'fonts', 'copy-non-images']);

/**
 * Build
 */
gulp.task('build', ['compile']);

/**
 * Copy non images
 */
gulp.task('copy-non-images', ['clean'], function() {
    var imagesPaths = gp.getImagesPaths();
    var streams = imagesPaths.map(function(imagePaths) {
        return gulp.src(path.join(imagePaths.sources, '**', '!(*.png|*.jpg|*.jpeg|*.gif)'))
            .pipe(gulp.dest(imagePaths.dest));
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

    return stream;
});

/**
 * PHPCS
 */
gulp.task('phpcs', ['phpcs:application', 'phpcs:views', 'phpcs:others']);

/**
 * PHPCS application
 */
gulp.task('phpcs:application', function() {
    return gulp.src(config.phpcs.application.dir)
        .pipe($.phpcs({
            bin: config.phpcs.options.bin,
            standard: config.phpcs.application.standard
        }))
        .pipe($.phpcs.reporter('log'))
        .pipe($.phpcs.reporter('fail'));
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
        .pipe($.phpcs.reporter('log'))
        .pipe($.phpcs.reporter('fail'));
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
        .pipe($.phpcs.reporter('log'))
        .pipe($.phpcs.reporter('fail'));
});

/**
 * PHPCSDiff
 */
gulp.task('phpcsdiff', function() {
    var fileList = require('execSync').exec('git diff-index --name-only --diff-filter=ACMR HEAD').stdout.split('\n');

    function streamify(dir, standard) {
        var filtered = gp.util.match(fileList, dir);
        return gulp.src(filtered)
            .pipe($.phpcs({
                bin: config.phpcs.options.bin,
                standard: standard
            }))
            .pipe($.phpcs.reporter('log'));
    }

    return es.merge.apply(null, [
        streamify(config.phpcs.application.dir, config.phpcs.application.standard),
        streamify(config.phpcs.views.dir, config.phpcs.views.standard),
        streamify(config.phpcs.others.dir, config.phpcs.others.standard)
    ]).pipe($.phpcs.reporter('fail'));
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
            console.log('Command: ');
            console.log(chalk.yellow('ssh -L 35729:localhost:' + port + ' ' + require('os').hostname()));
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
gulp.task('codeception', ['codeceptbuild'], $.shell.task('../vendor/bin/codecept run --html', {
    cwd: 'tests'
}));

/**
 * Frontend mocha tests
 */
gulp.task('mocha', function() {
    var fs = require('fs');
    if (!fs.existsSync('./tests/frontend/config.json')) {
        return;
    }
    var mochaConfig = require('./tests/frontend/config.json');
    var mochaPhantomJS = require('gulp-mocha-phantomjs');

    var stream = mochaPhantomJS();
    stream.write({path: mochaConfig.host + mochaConfig.path});
    stream.end();
    return stream;
});

/**
 * Test
 */
gulp.task('test', ['codeception', 'mocha']);

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
        .pipe($.rename('pre-commit'))
        .pipe($.chmod(755))
        .pipe(gulp.dest('.git/hooks/'));
});

/**
 * Commit
 */
gulp.task('commit', ['phplint', 'jshint', 'jscsdiff', 'phpcsdiff']);

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
 * Watch
 */
gulp.task('watch', ['styles:findport'], function() {
    // Start live reload server immediately, don't wait for change
    $.livereload.listen(config.port);

    // Watch .js files (causes page reload)
    $.saneWatch(gp.getScriptsSourcePath(), {
        debounce: 300
    }, function(filename, filepath) {
        $.livereload.changed(path.join(filepath, filename), config.port);
    });

    // Watch .scss files
    $.saneWatch(gp.getStylesSourcePathWithGlob(), {
        debounce: 300
    }, function(filename, filepath) {
        styles(false, path.join(filepath, filename));
    });

    // Watch images
    $.saneWatch(gp.getImagesSourcePathWithGlob(), {
        debounce: 300
    }, function(filename, filepath) {
        $.livereload.changed(path.join(filepath, filename), config.port);
    });
});
