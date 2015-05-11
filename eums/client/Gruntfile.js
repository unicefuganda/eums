'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist'
    };

    var venvHome = grunt.option('venvHome') || '~/.virtualenvs/';

    // Define the configuration for all the tasks
    grunt.initConfig({
        // The actual grunt server settings
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
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
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
                            connect().use(
                                '/bower_components',
                                connect.static('./bower_components')
                            ),
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
                    compress: true,
                    paths: [
                        'less',
                        'bower_components/bootstrap/less',
                        'bower_components/bootstrap/less/mixins'
                    ]
                },
                files: {
                    'app/css/app.css': 'less/app.less'
                }
            }
        },

        uglify: {
            all: {
                files: {
                    'dist/app.min.js': ['app/scripts/**/*.js']
                },
                options: {
                    mangle: false
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
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

        // Empties folders to start fresh
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

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },

        protractor: {
            headless: {
                options: {
                    configFile: 'test/functional_conf.js',
                    keepAlive: false,
                    args: {
                        specs: ['test/functional/*-spec.js'],
                        browser: 'chrome'
                    }
                }
            },
            headless_selenium: {
                options: {
                    configFile: 'test/functional_selenium_conf.js',
                    keepAlive: false,
                    args: {
                        specs: ['test/functional/*-spec.js'],
                        browser: 'chrome'
                    }
                }
            },
            firefox: {
                options: {
                    configFile: 'test/functional_conf.js',
                    keepAlive: false,
                    args: {
                        specs: ['test/functional/*-spec.js'],
                        browser: 'firefox'
                    }
                }
            }
        },

        run: {
            options: {
                wait: false
            },
            djangoServer: {
                cmd: './start-server.sh',
                args: ['eums.test_settings', 'eums_test']
            },
            djangoServerStaging: {
                cmd: './start-server.sh',
                args: ['eums.snap_settings', 'app_test']
            }
        },

        shell: {
            sourceEnv: {
                command: 'source ' + venvHome + 'eums/bin/activate'
            },
            createDb: {
                command: 'createdb eums_test'
            },
            createStagingDb: {
                command: 'createdb app_test'
            },
            runMigrations: {
                command: 'python manage.py migrate --settings=eums.test_settings',
                options: {
                    stderr: false,
                    execOptions: {
                        cwd: '../..'
                    }
                }
            },
            runStagingMigrations: {
                command: 'python manage.py migrate --settings=eums.snap_settings',
                options: {
                    stderr: false,
                    execOptions: {
                        cwd: '../..'
                    }
                }
            },
            seedData: {
                command: 'python manage.py loaddata eums/client/test/functional/fixtures/user.json --settings=eums.test_settings',
                options: {
                    stderr: false,
                    execOptions: {
                        cwd: '../..'
                    }
                }
            },
            mapData: {
                command: 'python manage.py loaddata eums/client/test/functional/fixtures/mapdata.json --settings=eums.test_settings',
                options: {
                    stderr: false,
                    execOptions: {
                        cwd: '../..'
                    }
                }
            },
            mapDataStaging: {
                command: 'python manage.py loaddata eums/client/test/functional/fixtures/mapdata.json --settings=eums.snap_settings',
                options: {
                    stderr: false,
                    execOptions: {
                        cwd: '../..'
                    }
                }
            },
            seedStagingData: {
                command: 'python manage.py loaddata eums/client/test/functional/fixtures/user.json --settings=eums.snap_settings',
                options: {
                    stderr: false,
                    execOptions: {
                        cwd: '../..'
                    }
                }
            },
            stopServer: {
                command: 'kill -9 $(lsof -t -i:8000)'
            },
            dropDb: {
                command: 'dropdb eums_test --if-exists'
            },
            dropStagingDb: {
                command: 'dropdb app_test --if-exists'
            }
        },
        ngconstant: {
            options: {
                name: 'eums.config',
                dest: 'app/scripts/config/config.js',
                constants: {
                    EumsConfig: grunt.file.readJSON('config/development.json')
                }
            },
            dev: {
                constants: {
                    EumsConfig: grunt.file.readJSON('config/development.json')
                }
            },
            staging: {
                constants: {
                    EumsConfig: grunt.file.readJSON('config/staging.json')
                }
            },
            prod: {
                constants: {
                    EumsConfig: grunt.file.readJSON('config/production.json')
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-less');

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

    grunt.registerTask('build', [
        'clean:dist',
        'ngconstant:dev',
        'newer:uglify:all',
        'less'
    ]);

    grunt.registerTask('build-staging', [
        'clean:dist',
        'ngconstant:staging',
        'newer:uglify:all',
        'less'
    ]);

    grunt.registerTask('prepare-for-server-start', [
        'build',
        'clean:server',
        'shell:sourceEnv',
        'shell:dropDb',
        'shell:createDb',
        'shell:runMigrations',
        'shell:seedData',
        'shell:mapData'
    ]);

    grunt.registerTask('functional', [
        'prepare-for-server-start',
        'run:djangoServer',
        'protractor:headless',
        'shell:stopServer'
    ]);

    grunt.registerTask('functional-selenium', [
        'build',
        'clean:server',
        'shell:dropDb',
        'shell:createDb',
        'shell:runMigrations',
        'shell:seedData',
        'shell:mapData',
        'run:djangoServer',
        'protractor:headless_selenium',
        'shell:stopServer'
    ]);

    grunt.registerTask('functional-staging', [
        'build',
        'clean:server',
        'shell:dropStagingDb',
        'shell:createStagingDb',
        'shell:runStagingMigrations',
        'shell:seedStagingData',
        'shell:mapDataStaging',
        'run:djangoServerStaging',
        'protractor:headless',
        'shell:stopServer'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'build',
        'unit',
        'functional'
    ]);
};
