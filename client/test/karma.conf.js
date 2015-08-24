module.exports = function (config) {
    'use strict';

    config.set({
        autoWatch: true,

        basePath: '../',

        frameworks: ['jasmine'],

        files: [
            'node_modules/jasmine-collection-matchers/lib/pack.js',
            'bower_components/lodash/dist/lodash.min.js',
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/sugar/release/sugar.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/angular-gs-capitalize/build/angular-gs-capitalize.min.js',
            'bower_components/angular-gs-to-camel-case/build/angular-gs-to-camel-case.min.js',
            'bower_components/angular-gs-to-snake-case/build/angular-gs-to-snake-case.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'bower_components/angular-route/angular-route.min.js',
            'bower_components/ng-table/ng-table.js',
            'bower_components/si-table/dist/si-table.js',
            'bower_components/leaflet/dist/leaflet.js',
            'bower_components/select2/select2.js',
            'bower_components/moment/moment.js',
            'bower_components/moment-range/dist/moment-range.min.js',
            'bower_components/angular-animate/angular-animate.min.js',
            'bower_components/angular-sanitize/angular-sanitize.min.js',
            'bower_components/ngtoast/dist/ngToast.min.js',
            'bower_components/angular-busy/dist/angular-busy.min.js',
            'bower_components/tree-grid-directive/src/tree-grid-directive.js',
            'bower_components/chosen/chosen.jquery.min.js',
            'bower_components/angular-chosen-localytics/chosen.js',
            'bower_components/es5-shim/es5-shim.min.js',
            'bower_components/es5-shim/es5-sham.min.js',
            'bower_components/angular-file-upload/angular-file-upload.min.js',
            'bower_components/intl-tel-input/build/js/intlTelInput.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'app/scripts/**/*.js',
            '.tmp/config/config.js',
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
