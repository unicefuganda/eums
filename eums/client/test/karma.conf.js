module.exports = function (config) {
    'use strict';

    config.set({
        autoWatch: true,

        basePath: '../',

        frameworks: ['jasmine'],

        files: [
            'bower_components/angular/angular.min.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-route/angular-route.min.js',
            'bower_components/ng-table/ng-table.js',
            'bower_components/si-table/dist/si-table.js',
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/angular-animate/angular-animate.min.js',
            'bower_components/angular-sanitize/angular-sanitize.min.js',
            'bower_components/ngtoast/dist/ngToast.min.js',
            'bower_components/angular-busy/dist/angular-busy.min.js',
            'bower_components/moment/min/moment.min.js',
            'bower_components/select2/select2.min.js',
            'bower_components/tree-grid-directive/src/tree-grid-directive.js',
            'app/media/lodash.js',
            'app/scripts/**/*.js',
            'test/spec/**/*.js'
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
