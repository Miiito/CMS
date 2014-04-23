var tinylr = require('tiny-lr-fork');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		environment: grunt.option('environment') || false,
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				//files: buildJsFiles
				files: []
				/*files: {
					'protected/assets/main/dist/js/combined.js' : [
						'protected/assets/main/src/js/someplugin.js',
						'protected/assets/main/src/js/site.js'
					]
				}*/
			}
		},
		jshint: {
			options: {
				jshintrc: true
			},
			gruntfile: ['Gruntfile.js'],
			all: {
				files: {
					src: []
				}
			}
		},
		imagemin: {
			dist: {
				//files: images
				files: []
			}
		},
		sass: {
			watch: {
				options: {
					style: 'expanded'
				},
				//files: csswatches
				files: []
				/*files: [{
					expand: true,
					cwd: 'protected/assets/main/src/scss',
					src: ['*.scss'],
					dest: 'protected/assets/main/src/css',
					ext: '.css'
				}]*/
			},
			dist: {
				options: {
					style: 'compressed'
				},
				//files: cssbuild
				files: []
				/*files: [{
					expand: true,
					cwd: 'protected/assets/main/src/scss',
					src: ['*.scss'],
					dest: 'protected/assets/main/dist/css',
					ext: '.css'
				}]*/
			}
		},
		copy: {
			fonts: {
				files: []
			}
		},
		shell: {
			setup: {
				command: 'php setup.php <%= environment %>',
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
				//files: scsswatch,
				files: [],
				//files: 'protected/assets/main/src/scss/**/*',
				tasks: ['sass:watch'],
				options: {
					atBegin: true,
					// do not spawn new process: required because new process wouldn't have files property set
					spawn: false
				}
			},
			reload: {
				//files: cssreload,
				files: [],
				//files: 'protected/assets/main/src/css/**/*',
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
					'!views/*/*', '!mail/layouts/*', '!mail/views/*', '!modules/*/views/*/*',
					'!setup.php', '!web/**/*', '!tests/**/*', '!config/**/*']
			},
			options: {
				bin: 'vendor/bin/phpcs',
				standard: 'vendor/yiisoft/yii2-coding-standards/Yii2'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-prompt');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-phpcs');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.renameTask('watch', 'watchorig');

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
		grunt.config.set('sass.watch.files',csswatches);
		grunt.config.set('sass.dist.files',cssbuild);
		grunt.config.set('copy.fonts.files',fonts);
		grunt.config.set('watchorig.css.files',scsswatch);
		grunt.config.set('watchorig.reload.files',cssreload);
		grunt.config.set('jshint.all.files.src',hintJsFiles);
	});

	grunt.registerMultiTask('tinylr-findport', 'Find a port and start the tinylr server', function() {
		var server = tinylr();
		var task = this.data.task;
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
					grunt.task.run(task);
				}
			});
		}

		tryPort();
	});

	grunt.registerTask('watch', ['getpackages', 'tinylr-findport']);

	grunt.registerTask('build', ['getpackages', 'jshint', 'uglify', 'imagemin', 'sass:dist', 'copy:fonts']);

	grunt.registerTask('hint', ['getpackages', 'jshint']);

	grunt.registerTask('setup', ['prompt', 'shell:setup']);

	// Default task(s).
	grunt.registerTask('default', ['build']);

};
