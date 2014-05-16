module.exports = function(grunt) {
	if (grunt.option('time')) {
		require('time-grunt')(grunt);
	}

	require('jit-grunt')(grunt, {
		sass: 'grunt-sass', // jit-grunt looks for grunt-contrib-sass first
		watchorig: 'grunt-contrib-watch',
		replace: 'grunt-text-replace'
	});

	// Project configuration.
	grunt.initConfig({
		environment: grunt.option('environment') || false,
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			// Clean any pre-commit hooks in .git/hooks directory
			hooks: ['.git/hooks/pre-commit']
		},
		githooks: {
			staged: {
				options: {
					template: 'hooks/staged.js.hbs'
				},
				'pre-commit': 'commit'
			}/*,
			update: {
				options: {
					template: 'hooks/update.js.hbs'
				},
				'post-merge': true,
				'post-checkout': true
			}*/
		},
		phplint: {
			precommit: ['**/*.php'],
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				files: []
			}
		},
		jshint: {
			gruntfile: {
				files: {
					src: ['Gruntfile.js']
				},
				options: {
					curly: true,
					es3: false
				}
			},
			all: {
				options: {
					jshintrc: true,
				},
				files: {
					src: []
				}
			}
		},
		imagemin: {
			dist: {
				files: []
			}
		},
		sass: {
			watch: {
				options: {
					style: 'expanded'
				},
				files: []
			},
			dist: {
				options: {
					style: 'compressed'
				},
				files: []
			}
		},
		copy: {
			fonts: {
				files: []
			},
			images: {
				files: []
			}
		},
		copykeep: {
			testroot: {
				src: 'tests/_bootstrap.local.sample',
				dest: 'tests/_bootstrap.local.php'
			},
			acceptancehost: {
				src: 'tests/acceptance.suite.sample',
				dest: 'tests/acceptance.suite.yml',
			}
		},
		shell: {
			setup: {
				command: 'php setup.php <%= environment %>',
				options: {
					stdout: true
				}
			},
			codeceptbuild: {
				command: 'vendor/bin/codecept build',
				options: {
					stdout: true
				}
			},
			codeception: {
				command: 'vendor/bin/codecept run --coverage --html --coverage-html',
				options: {
					stdout: true
				}
			},
			test: {
				command: 'echo <%= environment %>',
				options: {
					stdout: true
				}
			}
		},
		prompt: {
			setup: {
				options: {
					questions: [
						{
							config: 'environment',
							type: 'list',
							message: 'Select environment',
							default: 'development',
							choices: ['development','staging','production',{ name: 'other', value: false }],
							when: function(answers) {
								return grunt.config.get('environment') === false;
							}
						},
						{
							config: 'environment',
							type: 'input',
							message: 'Type custom environment',
							when: function(answers) {
								return answers.environment === false;
							}
						}
					]
				}
			},
			testroot: {
				options: {
					questions: [
						{
							config: 'testroot',
							message: 'Base URL of this app (e.g. "/me/yii2/basic")',
							type: 'input'
						}
					]
				}
			}
		},
		replace: {
			testroot: {
				src: 'tests/_bootstrap.local.php',
				overwrite: true,
				replacements: [{
					from: /define\('TEST_ENTRY_URL',\s*'[^']*'\);/,
					to: function(matchedWord, index, fullText, regexMatches) {
						return "define('TEST_ENTRY_URL', '/" + grunt.config('testroot').replace(/^(\/)|(\/)$/g, '') + "/testweb/index-test.php');";
					}
				}]
			}
		},
		'tinylr-findport': {
			watch: {
				task: 'watchorig',
				target: 'reload'
			}
		},
		watchorig: {
			css: {
				files: [],
				tasks: ['sass:watch'],
				options: {
					atBegin: true,
					// do not spawn new process: required because new process wouldn't have files property set
					spawn: false
				}
			},
			reload: {
				files: [],
				options: {
					// libsass is too fast for the default 100 interval
					interval: 20,
					// Start a live reload server on the default port 35729
					livereload: true
				}
			}
		},
		phpcs: {
			application: {
				dir: ['**/*.php',
					'!vendor/**/*', '!node_modules/**/*',
					'!views/*/*', '!mail/*/*', '!modules/*/views/*/*',
					'!migrations/*',
					'!setup.php', '!web/**/*', '!tests/**/*', '!config/**/*']
			},
			options: {
				bin: 'vendor/bin/phpcs',
				standard: 'vendor/yiisoft/yii2-coding-standards/Yii2'
			}
		}
	});

	/*grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-prompt');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-phpcs');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.renameTask('watch', 'watchorig');*/

	grunt.registerTask('getpackages','Get packages from yii and configure tasks', function() {
		var getPackages = require('get-packages');
		var i, l;

		getPackages.init({
			applicationPath: '.',
			yiiPackagesCommand: 'yii packages'
		});

		var packages = getPackages.get();
		var buildJsFiles = {},
		    hintJsFiles = [];
		for (i=0, l=packages.jsfiles.length; i<l; ++i) {
			buildJsFiles[packages.jsfiles[i].dist] = packages.jsfiles[i].sources;
			hintJsFiles = hintJsFiles.concat(packages.jsfiles[i].sources);
		}

		var csswatches = [],
			cssbuild = [],
			scsswatch = [],
			cssreload = [];
		for (i=0, l=packages.cssfiles.length; i<l; ++i) {
			csswatches.push({
				expand: true,
				cwd: packages.cssfiles[i].sources,
				src: ['*.scss'],
				dest: packages.cssfiles[i].dev,
				ext: '.css'
			});
			cssbuild.push({
				expand: true,
				cwd: packages.cssfiles[i].sources,
				src: ['*.scss'],
				dest: packages.cssfiles[i].dist,
				ext: '.css'
			});
			scsswatch.push(packages.cssfiles[i].sources + '/**/*');
			cssreload.push(packages.cssfiles[i].dev + '/**/*');
		}
		var images = [];
		var nonimages = [];
		var fonts = [];
		for (i=0, l=packages.packages.length; i<l; ++i) {
			if (packages.packages[i].imgPath) {
				images.push({
					expand: true,
					cwd: packages.packages[i].sources + '/' + packages.packages[i].imgPath + '/',
					src: ['**/*.{png,jpg,jpeg,gif}'],
					dest: packages.packages[i].dist + '/' + packages.packages[i].imgPath + '/'
				});
				cssreload.push(packages.packages[i].sources + '/' + packages.packages[i].imgPath + '/' + '**/*.{png,jpg,jpeg,gif}');
				nonimages.push({
					expand: true,
					cwd: packages.packages[i].sources + '/' + packages.packages[i].imgPath + '/',
					src: ['**/*', '!**/*.{png,jpg,jpeg,gif}'],
					dest: packages.packages[i].dist + '/' + packages.packages[i].imgPath + '/'
				});
			}
			if (packages.packages[i].fontPath) {
				fonts.push({
					expand: true,
					cwd: packages.packages[i].sources + '/' + packages.packages[i].fontPath + '/',
					src: ['**/*'],
					dest: packages.packages[i].dist + '/' + packages.packages[i].fontPath + '/'
				});
			}
		}

		grunt.config.set('uglify.build.files',buildJsFiles);
		grunt.config.set('imagemin.dist.files',images);
		grunt.config.set('copy.images.files',nonimages);
		grunt.config.set('sass.watch.files',csswatches);
		grunt.config.set('sass.dist.files',cssbuild);
		grunt.config.set('copy.fonts.files',fonts);
		grunt.config.set('watchorig.css.files',scsswatch);
		grunt.config.set('watchorig.reload.files',cssreload);
		grunt.config.set('jshint.all.files.src',hintJsFiles);
	});

	grunt.registerMultiTask('tinylr-findport', 'Find a port and start the tinylr server', function() {
		var tinylr = require('tiny-lr-fork');
		var server = tinylr();
		var task = this.data.task;
		var load = this.data.load;
		var rename = this.data.rename;
		var target = this.data.target;

		var startPort = false;
		if (grunt.file.exists('.lrport')) {
			startPort = parseInt(grunt.file.read('.lrport'),10);
		}

		function tryPort(num) {
			if (num === undefined) {
				num = 0;
			}
			if (num == 10) {
				grunt.fatal('Failed to find port after 10 attempts.');
			}
			var port = 35729 + Math.floor((Math.random()*10000)+1);
			if (startPort) {
				port = startPort;
				startPort = false;
			}
			grunt.log.writeln('Try port:'+port);
			server.listen(port, function(err) {
				if(err) {
					if (err.code === 'EADDRINUSE') {
						tryPort();
					} else {
						grunt.fatal(err);
					}
				} else {
					server.close();
					grunt.file.write('.lrport', port);
					grunt.log.write('Found port:');
					grunt.log.writeln(port.toString().green.bold);
					grunt.config.set(task+'.'+target+'.options.livereload', port);
					if (load) {
						grunt.loadNpmTasks(load);
						if (rename) {
							grunt.renameTask(rename, task);
						}
					}
					grunt.task.run(task);
				}
			});
		}

		tryPort();
	});

	grunt.registerTask('changedonly','Lint and check only those files that are about to be commited', function() {

		var list = require('execSync').exec('git diff-index --cached --name-only --diff-filter=ACMR HEAD').stdout.split("\n");
		var path = require('path');

		list = list.filter(function(p) {
			return path.extname(p) == '.php';
		});

		grunt.config.set('phplint.precommit', list);
		//grunt.config.set('phpcs.application.dir', list);
	});

	grunt.registerTask('phpcswrapper','Only run phpcs if there are files to check', function() {
		if (grunt.config.get('phpcs.application.dir').length) {
			grunt.task.run('phpcs');
		}
	});

	grunt.registerMultiTask('copykeep', 'Copy source to destination if destination does not exist', function() {
		var source = this.data.src,
		    destination = this.data.dest;
		if (!grunt.file.exists(destination)) {
			grunt.file.copy(source, destination);
		}
	});

	grunt.registerTask('commit', ['changedonly', 'phplint', 'hint']);

	grunt.registerTask('watch', ['getpackages', 'tinylr-findport']);

	grunt.registerTask('build', ['getpackages', 'jshint', 'uglify', 'imagemin', 'copy:images', 'sass:dist', 'copy:fonts']);

	grunt.registerTask('hint', ['getpackages', 'jshint']);

	grunt.registerTask('setup', ['prompt:setup', 'shell:setup']);

	grunt.registerTask('hooks', ['clean:hooks', 'githooks']);

	grunt.registerTask('postinstall', ['hooks', 'setup'/*, 'localemail'*/]);

	grunt.registerTask('testroot', ['copykeep:testroot', 'copykeep:acceptancehost', 'prompt:testroot', 'replace:testroot']);

	grunt.registerTask('test', ['shell:codeceptbuild', 'shell:codeception']);

	// Default task(s).
	grunt.registerTask('default', ['build']);

};
