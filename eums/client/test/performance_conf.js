exports.config = {

    seleniumServerJar: '../node_modules/selenium-standalone/.selenium/2.43.1/server.jar',

    chromeDriver: '/usr/local/bin/chromedriver',

    chromeOnly: true,

    specs: ['test/performance/*-spec.js'],

    baseUrl: 'http://localhost:9000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        showColors: true
    }
};