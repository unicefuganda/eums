var underscore = require("underscore");
var mainConfig = require("./functional_conf.js");
var seleniumConfig = underscore.extend(mainConfig.config, {seleniumAddress: 'http://localhost:4444/wd/hub'});
console.log(seleniumConfig);

exports.config = seleniumConfig;

