module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Banner
		tag: {
			banner: '/*!\n' +
					' * <%= pkg.name %>\n' +
					' * <%= pkg.url %>\n' +
					' * @author(s) <%= pkg.author %>\n' +
					' * @version <%= pkg.version %>\n' +
					' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
					' */\n'
		},

		/*
		** JS Tasks
		*/
		jshint: {
			all: [
				'gruntfile.js',
				'js/global.js'
				// ignored files
			]
		},

		/*
		** CSS Tasks
		*/
		sass: {
			dist: {
				options: {
					style: 'expanded',
					compass: false
				},
				files: {
					'css/styles.css': 'css/scss/styles.scss'
				}
			}
		},

		autoprefixer: {
			options: {
				browsers: ['last 8 version', 'ie 8', 'ie 9']
			},
			dist: {
				files: {
					'css/styles.css': 'css/styles.css'
				}
			}
		},

		csso: {
			compress: {
				options: {
					report: 'gzip'
				},
				files: {
					'css/styles.min.css': ['css/styles.css']
				}
			}
		},

		uglify: {
			options: {
				banner: '<%= tag.banner %>'
			},
			dist: {
				files: {
					'js/global.min.js': 'js/global.js'
				}
			}
		},

		/*
		* Watch
		*/
		 watch: {
          scripts: {
          	files: ['js/global.js', 'gruntfile.js'],
              tasks: ['jshint', 'uglify'],
              options: {
                  livereload: true
              }
          },
          css: {
          	files: ['css/scss/styles.scss'],
              tasks: ['sass', 'autoprefixer', 'csso'],
              options: {
                  spawn: false,
                  livereload: true
              }
          }
      }
	});

	// Load all Grunt tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-csso');
	grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

	// Register Default Task
	grunt.registerTask('default', ['jshint', 'sass', 'autoprefixer', 'csso', 'uglify', 'watch']);
  //	grunt.registerTask('default', ['sass', 'autoprefixer', 'csso', 'watch']);
};
