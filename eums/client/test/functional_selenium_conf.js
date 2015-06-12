var SpecReporter = require('jasmine-spec-reporter');

exports.config = {
    allScriptsTimeout: 15000,

    seleniumServerJar: '../node_modules/selenium-standalone/.selenium/2.43.1/server.jar',

    seleniumAddress: 'http://localhost:4444/wd/hub',

    chromeDriver: '/usr/local/bin/chromedriver',

    directConnect: false,

    specs: ['test/functional/*-spec.js'],

    baseUrl: process.env.EUMS_HOST_URL,

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
