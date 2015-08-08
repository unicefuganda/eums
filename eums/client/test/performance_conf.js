exports.config = {

    allScriptsTimeout: 15000,

    seleniumServerJar: '../node_modules/selenium-standalone/.selenium/2.43.1/server.jar',

    seleniumAddress: 'http://localhost:4444/wd/hub',

    chromeDriver: '/usr/local/bin/chromedriver',

    directConnect: false,

    specs: ['performance/*-spec.js'],

    baseUrl: process.env['PERFORMANCE_TEST_BASE_URL'],

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000,
        showColors: true
    }
};
