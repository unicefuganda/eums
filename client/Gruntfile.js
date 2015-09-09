'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    connect: {
      options: {
        port: 9000,
        hostname: 'localhost'
      },
      test: {
        options: {
          port: 9001,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect.static('/test'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect.static(require('./bower.json').appPath || 'app')
            ];
          }
        }
      },
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          'app/scripts/{,*/}*.js',
          '!app/scripts/map/map.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: [
          'test/spec/{,*/}*.js',
          'test/functional/{,*/}*.js'
        ]
      }
    },

    less: {
      compile: {
        options: {
          compress: false,
          paths: [
            'less',
            'bower_components/bootstrap/less',
            'bower_components/bootstrap/less/mixins'
          ]
        },
        files: {
          '.tmp/css/app.min.css': 'less/app.less'
        }
      }
    },

    useminPrepare: {
      html: 'app/deps.html',
      flow: {
        steps: {
          js: ['concat'],
          css: ['concat']
        }
      }
    },

    ngAnnotate: {
      all: {
        files: {
          '.tmp/annotated/app.js': 'app/scripts/**/*.js'
        },
        options: {
          expand: true
        }
      },
    },

    uglify: {
      all: {
        files: {
          '.tmp/js/app.min.js': '.tmp/annotated/app.js'
        },
        options: {
          mangle: false,
          beautify: true
        }
      }
    },

    copy: {
      js: {
        expand: true,
        flatten: true,
        cwd: '.',
        src: ['.tmp/js/*.js', '.tmp/concat/**/*.js', 'app/js/**/*.js'],
        dest: 'dist/app/js/'
      },
      css: {
        expand: true,
        flatten: true,
        cwd: '.tmp/',
        src: ['css/*.css', 'concat/**/*.css'],
        dest: 'dist/app/css/'
      },
      json: {
        expand: true,
        cwd: 'app/data/',
        src: '**/*.json',
        dest: 'dist/app/data/'
      },
      media: {
        expand: true,
        cwd: 'app/media/',
        src: '**/*',
        dest: 'dist/app/media/'
      },
      flags: {
        expand: true,
        cwd: 'bower_components/intl-tel-input/build/img',
        src: '*',
        dest: 'dist/app/media/'
      },
      intlTelInput: {
        expand: true,
        cwd: 'bower_components/intl-tel-input/lib/libphonenumber/build/',
        src: '*',
        dest: 'dist/app/js/'
      },
      fonts: {
        expand: true,
        cwd: 'bower_components/bootstrap/fonts/',
        src: '*',
        dest: 'dist/app/fonts/'
      },
      chosen: {
        expand: true,
        cwd: 'bower_components/angular-chosen-localytics/',
        src: '*.gif',
        dest: 'dist/app/css/'
      },
      select2: {
        expand: true,
        cwd: 'bower_components/select2/',
        src: ['*.png', '*.gif'],
        dest: 'dist/app/css/'
      },
      html: {
        expand: true,
        cwd: 'app/views/',
        src: '**/*.html',
        dest: 'dist/app/views/'
      },
      toBuild: {
        expand: true,
        cwd: 'dist/',
        src: '**/*',
        dest: '../build/eums/client/'
      },
      eums: {
        expand: true,
        cwd: '../eums/',
        src: '**/*',
        dest: '../build/eums/'
      },
      eumsManage: {
        expand: true,
        cwd: '../',
        src: 'manage.py',
        dest: '../build/'
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/{,*/}*',
            '!dist/.git*'
          ]
        }]
      },
      build: {
        files: [{
          dot: true,
          src: [
            '../build/{,*/}*',
            '!../build/.git*'
          ]
        }]
      }
    },

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    protractor: {
      options: {
        keepAlive: false
      },
      performance: {
        options: {
          configFile: 'test/performance_conf.js'
        }
      },
      chrome: {
        options: {
          configFile: 'test/functional_chrome_conf.js'
        }
      },
      chromeMulti: {
        options: {
          configFile: 'test/functional_multi_conf.js'
        }
      },
      headless: {
        options: {
          configFile: 'test/functional_selenium_conf.js'
        }
      }
    },

    shell: {
      runMigrations: {
        command: 'python manage.py migrate',
        options: {
          stderr: false,
          execOptions: {
            cwd: '../'
          }
        }
      },
      setupPermissions: {
        command: 'python manage.py setup_permissions',
        options: {
          stderr: false,
          execOptions: {
            cwd: '../'
          }
        }
      },
      mapData: {
        command: 'python manage.py shell <  client/test/functional/fixtures/mapdata_code.py',
        options: {
          stderr: false,
          execOptions: {
            cwd: '../'
          }
        }
      },
    },

  });

  grunt.registerTask('unit', [
    'clean:dist',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('copy:toDist', 'Copy to Dist', [
    'copy:js',
    'copy:css',
    'copy:json',
    'copy:html',
    'copy:intlTelInput',
    'copy:flags',
    'copy:select2',
    'copy:chosen',
    'copy:media',
    'copy:fonts'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jshint:all',
    'ngAnnotate:all',
    'uglify:all',
    'less',
    'useminPrepare',
    'concat:generated',
    'copy:toDist'
  ]);

  grunt.registerTask('package', 'Build, Copy to Build', [
    //'clean:build',
    'build',
    'copy:toBuild',
    'copy:eums',
    'copy:eumsManage'
  ]);

  grunt.registerTask('prep-test-env', 'Prepare test environment before running tests', [
    'shell:runMigrations',
    'shell:setupPermissions',
    'shell:mapData',
    'run:djangoServer',
  ]);

  grunt.registerTask('functional', 'Run functional tests using chrome', [
    'prep-test-env',
    'protractor:chrome'
  ]);

  grunt.registerTask('functional:multi', 'Run functional tests using multiple chrome instances', [
    'prep-test-env',
    'protractor:chromeMulti'
  ]);

  grunt.registerTask('functional:headless', 'Run functional tests in headless mode using selenium', [
    'prep-test-env',
    'protractor:headless'
  ]);

  grunt.registerTask('performance', [
    'protractor:performance'
  ]);

};
