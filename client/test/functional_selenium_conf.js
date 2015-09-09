var SpecReporter = require('jasmine-spec-reporter');
var ScreenShotReporter = require('protractor-screenshot-reporter');
var path = require('path');
var fs = require('fs-extra');


exports.config = {
    allScriptsTimeout: 15000,

    seleniumServerJar: '../node_modules/selenium-standalone/.selenium/2.43.1/server.jar',

    seleniumAddress: 'http://localhost:4444/wd/hub',

    chromeDriver: '/usr/local/bin/chromedriver',

    directConnect: false,

    specs: ['functional/*-spec.js'],

    baseUrl: 'http://localhost:9000',

    framework: 'jasmine2',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 90000,
        print: function () {}
    },

    onPrepare: function () {
        fs.removeSync('./functional/screenshots');
        browser.driver.manage().window().setSize(1280, 800);

        jasmine.getEnv().addReporter(new SpecReporter({
            displayFailuresSummary: true,
            displaySpecDuration: true,
            displayStacktrace: 'summary'
        }));

        jasmine.getEnv().addReporter(new ScreenShotReporter({
            baseDirectory: 'functional/screenshots',
            pathBuilder: function pathBuilder(spec, descriptions, results, capabilities) {
                return path.join(descriptions.join('-'));
            },
            takeScreenShotsOnlyForFailedSpecs: true
        }));
    }
};
