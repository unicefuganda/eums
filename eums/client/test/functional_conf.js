var SpecReporter = require('jasmine-spec-reporter');

exports.config = {
    allScriptsTimeout: 15000,

    seleniumServerJar: '../node_modules/selenium-standalone/.selenium/2.43.1/server.jar',

    chromeDriver: '/usr/local/bin/chromedriver',

    directConnect: true,

    specs: ['test/functional/*-spec.js'],

    baseUrl: 'http://localhost:9000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        print: function () {}
    },

    onPrepare: function () {
        jasmine.getEnv().addReporter(new SpecReporter({
            displayFailuresSummary: true,
            displaySpecDuration: true,
            displayStacktrace: 'summary'
        }));
    }
};