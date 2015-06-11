var SpecReporter = require('jasmine-spec-reporter');

exports.config = {

    seleniumServerJar: '../node_modules/selenium-standalone/.selenium/2.43.1/server.jar',

    chromeDriver: '/usr/local/bin/chromedriver',

    directConnect: true,

    specs: ['test/functional/*-spec.js'],

    baseUrl: 'http://localhost:9000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        print: function () {}
    },

    onPrepare: function () {
        jasmine.getEnv().addReporter(new SpecReporter({
            displayFailuresSummary: true
        }));
    }
};