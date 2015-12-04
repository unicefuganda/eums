var fs = require('fs');
var config = function() {
    var rawJson = fs.readFileSync(__dirname + '/config.json');
    return JSON.parse(rawJson);
};

module.exports = config ();