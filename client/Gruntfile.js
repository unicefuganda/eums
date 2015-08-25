'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  var _ = require('lodash');
  var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;

  // Configurable paths for the application
  var venvHome = grunt.option('venvHome') || '~/.virtualenvs/';
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

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
      functional: {
        options: {
          port: 8150,
          middleware: function(connect, options) {
            return [proxySnippet];
          }
        },
        proxies: [{
          context: '/api/contact',
          host: 'localhost',
          port: 9005
        }, {
          context: '/',
          host: 'localhost',
          port: 9000
        }]
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
        cwd: '.tmp/',
        src: ['js/*.js', 'concat/**/*.js'],
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
      }
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
          'test/spec/{,*/}*.js'
        ]
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
      }
    },

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    run: {
      options: {
        wait: false,
        quiet: Infinity
      },
      djangoServer: {
        exec: 'python ../build/manage.py runserver 0.0.0.0:9000 --settings=eums.test_settings'
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
          configFile: (function() {
            if (grunt.option('multi')) {
              return 'test/functional_multi_conf.js'
            } else {
              return 'test/functional_chrome_conf.js'
            }
          })()
        }
      },
      headless: {
        options: {
          configFile: 'test/functional_selenium_conf.js'
        }
      }
    },

    shell: {
      dropDb: {
        command: 'echo "drop database eums_test" | psql -U postgres'
      },
      createDb: {
        command: 'echo "create database eums_test" | psql -U postgres'
      },
      runMigrations: {
        command: 'python manage.py migrate --settings=eums.test_settings',
        options: {
          stderr: false,
          execOptions: {
            cwd: '../'
          }
        }
      },
      seedData: {
        command: 'python manage.py loaddata client/test/functional/fixtures/user.json --settings=eums.test_settings',
        options: {
          stderr: false,
          execOptions: {
            cwd: '../'
          }
        }
      },
      mapData: {
        command: 'python manage.py shell < client/test/functional/fixtures/mapdata_code.py --settings=eums.test_settings',
        options: {
          stderr: false,
          execOptions: {
            cwd: '../'
          }
        }
      },
      setupPermissions: {
        command: 'python manage.py setup_permissions --settings=eums.test_settings',
        options: {
          stderr: false,
          execOptions: {
            cwd: '../'
          }
        }
      },
      processConfigs: {
        command: function(url) {
          return 'sed "s/localhost/' + url + '/" config/development.json > config/environment.json';
        }
      }
    },

    apimocker: {
      options: {
        configFile: 'test/functional/apimock/apimock.json'
      }
    }


  });

  grunt.registerTask('build-staging', 'builds staging with the specified url in the config', function(url) {
    if (url) {
      return grunt.task.run([
        'clean:dist',
        'shell:processConfigs:' + url,
        'ngconstant:staging',
        'uglify:all',
        'less'
      ]);
    } else {
      return grunt.task.run([
        'clean:dist',
        'shell:processConfigs:localhost',
        'ngconstant:staging',
        'uglify:all',
        'less'
      ]);
    }
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
    'ngAnnotate:all',
    'uglify:all',
    'less',
    'useminPrepare',
    'concat:generated',
    'copy:toDist'
  ]);

  grunt.registerTask('package', 'Build, Copy to Build', [
    'build',
    'copy:toBuild'
  ]);

  grunt.registerTask('test:run', [
    'package',
    'configureProxies:local',
    'run:djangoServer',
    'connect:local'
  ]);

  grunt.registerTask('prep-test-env', 'Prepare test environment before running tests', [
    'shell:dropDb',
    'shell:createDb',
    'shell:runMigrations',
    'shell:setupPermissions',
    'shell:seedData',
    'shell:mapData',
    'configureProxies:functional',
    'apimocker',
    'run:djangoServer',
    'connect:functional'
  ]);

  grunt.registerTask('functional', 'Run functional tests using chrome', [
    'prep-test-env',
    'protractor:chrome'
  ]);

  grunt.registerTask('functional:headless', 'Run functional tests in headless mode using selenium', [
    'prep-test-env',
    'protractor:headless'
  ]);

  grunt.registerTask('performance', [
    'protractor:performance'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'build',
    'unit',
    'functional'
  ]);
};
