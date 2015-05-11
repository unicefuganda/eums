exports.config = {

    seleniumServerJar: '../node_modules/selenium-standalone/.selenium/2.43.1/server.jar',

    chromeDriver: '/usr/local/bin/chromedriver',

    seleniumAddress: 'http://localhost:4444/wd/hub',
    directConnect: false,
    specs: ['test/functional/*-spec.js'],

    baseUrl: 'http://localhost:8000',

    framework: 'jasmine',

    jasmineNodeOpts: {
        showColors: true
    }
};
/*
var underscore = require("underscore");
var mainConfig = require("./functional_conf.js");
var seleniumConfig = underscore.extend(mainConfig.config, {seleniumAddress: 'http://localhost:4444/wd/hub', directConnect: false});
delete seleniumConfig.config.chromeOnly;
console.log(seleniumConfig);

exports.config = seleniumConfig;
*/
