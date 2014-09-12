exports.config = {

    seleniumServerJar: '../node_modules/selenium-standalone/.selenium/2.43.1/server.jar',

    chromeDriver: '/usr/local/bin/chromedriver',

    specs: ['test/functional/*-spec.js'],

    baseUrl: 'http://localhost:8000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        showColors: true
    }
};