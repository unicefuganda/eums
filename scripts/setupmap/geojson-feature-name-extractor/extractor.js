#!/usr/bin/env node

var fs = require('fs');
var config = require('./config.js');

var districtNames = function(districts){
    var names = JSON.parse(districts).features.map(function(feature){
        return feature.properties[config.districtNameLocator];
    });

    return JSON.stringify(names);
};

fs.readFile(__dirname + '/' + config.inputFilePath, 'utf8', function(err, districtFeatures) {
    if (err) {
        return console.log(err);
    }
    fs.writeFile(config.outFilePath, districtNames(districtFeatures), function(err) {
        if(err) {
            console.log(err);
        }
    });
});
