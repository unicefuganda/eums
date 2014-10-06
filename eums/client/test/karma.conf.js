module.exports = function (config) {
    'use strict';

    config.set({
        autoWatch: true,

        basePath: '../',

        frameworks: ['jasmine'],

        files: [
            'bower_components/angular/angular.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-route/angular-route.min.js',
            'bower_components/ng-table/ng-table.js',
            'bower_components/si-table/dist/si-table.js',
            'app/scripts/**/*.js',
            'test/spec/**/*.js',
            'test/spec/controllers/plan-controller-spec.js'
        ],

        exclude: [
        ],

        port: 8080,

        browsers: [
            'PhantomJS'
        ],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ],

        singleRun: false,

        colors: true,

        logLevel: config.LOG_INFO
    });
};
