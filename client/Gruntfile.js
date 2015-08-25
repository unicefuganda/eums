'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    var _ = require('lodash');

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
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(appConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function (connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('/test'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect.static(require('./bower.json').appPath || 'app')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: 'dist'
                }
            }
        },

        watch: {
            javascript: {
                files: ['app/scripts/**/*.js'],
                tasks: ['jshint', 'build']
            },
            less: {
                files: ['app/less/*.less'],
                tasks: ['less']
            }
        },

        watchify: {
            options: {
                keepalive: true
            },
            example: {
                src: ['./app/scripts/**/*.js'],
                dest: 'dist/app.min.js'
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
            }
          },
        },

        uglify: {
            all: {
                files: {
                  '.tmp/js/app.min.js' : ['.tmp/annotated/app.js', '.tmp/config/config.js']
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
            src: [ 'js/*.js', 'concat/**/*.js' ],
            dest: 'dist/app/js/'
          },
          css: {
            expand: true,
            flatten: true,
            cwd: '.tmp/',
            src: [ 'css/*.css', 'concat/**/*.css' ],
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
          toDjango: {
            expand: true,
            cwd: 'dist/',
            src: '**/*',
            dest: '../eums/client/'
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
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            'dist/{,*/}*',
                            '!dist/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
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
                exec: 'python ../manage.py runserver 0.0.0.0:9000 --settings=eums.test_settings'
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
                    configFile: (function () {
                        if (grunt.option('multi')) {
                            return 'test/functional_multi_conf.js'
                        }
                        else { return 'test/functional_chrome_conf.js' }
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
                    stderr: true,
                    execOptions: {
                        cwd: '../..'
                    }
                }
            },
            questionAndFlowData: {
                command: 'python manage.py shell_plus < eums/fixtures/load_flows_and_questions.py --settings=eums.test_settings',
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
                command: function (url) {
                    return 'sed "s/localhost/' + url +'/" config/development.json > config/environment.json';
                }
            }
        },

        ngconstant: {
            options: {
                name: 'eums.config',
                dest: '.tmp/config/config.js',
                constants: {
                    EumsConfig: grunt.file.readJSON('config/development.json')
                }
            },
            dev: {
                constants: {
                    EumsConfig: grunt.file.readJSON('config/development.json')
                }
            },
            test: {
                constants: {
                    EumsConfig: grunt.file.readJSON('config/test.json')
                }
            },
            staging: {
                constants: {
                    EumsConfig: grunt.file.readJSON('config/environment.json')
                }
            },
            prod: {
                constants: {
                    EumsConfig: grunt.file.readJSON('config/production.json')
                }
            }
        },

        apimocker: {
            options: {
                configFile: 'test/functional/apimock/apimock.json'
            }
        }


    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('build-staging', 'builds staging with the specified url in the config', function (url) {
        if (url) {
            return grunt.task.run([
                'clean:dist',
                'shell:processConfigs:' + url,
                'ngconstant:staging',
                'uglify:all',
                'less'
            ]);
        }
        else {
            return grunt.task.run([
                'clean:dist',
                'shell:processConfigs:localhost',
                'ngconstant:staging',
                'uglify:all',
                'less'
            ]);
        }
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('unit', [
        'clean:server',
        'connect:test',
        'ngconstant:dev',
        'karma'
    ]);

    grunt.registerTask('watch', [
        'watchify:example'
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
      'ngAnnotate:all',
      'uglify:all',
      'less',
      'useminPrepare',
      'concat:generated',
      'copy:toDist'
    ]);

    grunt.registerTask('build:dev', [
      'clean:dist',
      'ngconstant:dev',
      'build'
    ]);

    grunt.registerTask('build:test', [
      'clean:dist',
      'ngconstant:test',
      'build',
      'copy:toDjango'
    ]);

    grunt.registerTask('deploy:local', 'Build, Copy to Django', [
      'build:dev',
      'copy:toDjango'
    ]);

    grunt.registerTask('prep-test-env', 'Prepare test environment before running tests', [
        'build:test',
        'shell:dropDb',
        'shell:createDb',
        'shell:runMigrations',
        'shell:setupPermissions',
        'shell:questionAndFlowData',
        'shell:seedData',
        'shell:mapData',
        'apimocker'
    ]);

    grunt.registerTask('functional', 'Run functional tests using chrome', [
        'prep-test-env',
        'run:djangoServer',
        'protractor:chrome'
    ]);

    grunt.registerTask('functional-headless', 'Run functional tests in headless mode using selenium', [
        'apimocker',
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
