'use strict';

describe('Dashboard', function () {
    var loginPage, homePage, started;

    describe('load', function() {
        var fs = require('fs');
        //TODO: place the folder in config
        var testResultFolder = "/testResults";
        var d = new Date();
        var testResultsFile  = testResultFolder + "/" + d.getMonth()+'-'+d.getDate()+'-'+d.getYear()+' '+(d.getHours()+1)+'_'+d.getMinutes() + ".xml";
        if(!fs.existsSync(testResultFolder)) {
            console.log("Creating folder")
            fs.mkdirSync(testResultFolder);
        }
        if(!fs.existsSync(testResultsFile)) {
            console.log("Creating file")
            fs.openSync(testResultsFile, 'w');
        }

        beforeEach(function () {
            browser.ignoreSynchronization = true;
            browser.get('/');
            loginPage = require('../functional/pages/login-page');
            started = new Date().getTime();
            console.log("Started at: " + started);
            homePage = loginPage.loginWithCredentials('admin', 'admin');
        });

        afterEach(function () {
            loginPage.logout();
        });


        function timeWaitingForPredicate(predicate, target){
            var start = new Date().getTime();
            console.log("Waiting for predicate");
            browser.wait(function () {
                //console.log("Checking windmill..." + predicate);
                return predicate().then(function(value){return value;});
            }.bind(this), 10000).then(function(){
                var end = new Date().getTime();
                var duration = end-start;
                console.log("predicate set " + duration + " ms");
                target(duration, end);
            }.bind(this));
        }


        function timeWaitingForPredicateNegation(predicate, target){
            var start = new Date().getTime();
            console.log("Waiting for predicate");
            browser.wait(function () {
                console.log("Waiting function called");
                return predicate().then(function(value){
                    console.log("Checking windmill..." + value);
                    return !value;
                });
            }.bind(this), 10000).then(function(){
                var end = new Date().getTime();
                var duration = end-start;
                console.log("predicate set " + duration + " ms");
                target(duration, end);
            }.bind(this));
        }

        function saveResultsToFile(results, done) {
            fs.readFile(testResultsFile, 'utf8', function (err, data) {
                console.log("Read:  " + data);
                if (err || !data) {
                    console.log("No data in file: " + err);
                    data = "<testResults>\n<\/testResults>";
                }

                var tagsXml = "";

                for(var resultIx in results){
                    console.log("Adding result: " + results[resultIx]);
                    tagsXml = tagsXml + results[resultIx] + "\n";
                };

                var result = data.replace('<\/testResults>', tagsXml + '\n<\/testResults>');

                console.log("tagXml is:  " + tagsXml);
                console.log("Writing:  " + result);
                fs.writeFile(testResultsFile, result, 'utf8', function (err) {
                    if (err) return console.log(err);
                    done();
                });
            });
        }

        function generateSampleResultXml(title, duration, timestamp){
            var retStr = "<httpSample t=\"" + duration + "\" lt=\"" + duration + "\" ts=\"" + timestamp + "\" s=\"true\" lb=\"" + title + "\" rc=\"301\" rm=\"No Remark\" tn=\"Thread Group 1-1\" dt=\"text\" by=\"286\"/>";
            console.log("Returning: " + retStr);
            return retStr;
        }

        it('performance metrics', function (done) {
            console.log("test running at: " + new Date().getTime());
            var results = [];

            //FIXME: need to handle situation where the page is rendered so fast that the wait for the windmill to display times out
            timeWaitingForPredicate(homePage.windmill.isDisplayed, function (duration, timestamp) {
                console.log("executing after predicate ");
                var resStr = generateSampleResultXml("Dashboard showing", duration, timestamp);
                console.log("Pushing : " + resStr);
                results.push(resStr);
                console.log("Array after push : " + results);
                timeWaitingForPredicateNegation(homePage.windmill.isDisplayed, function (duration, timestamp) {
                    results.push(generateSampleResultXml("Dashboard loaded", duration, timestamp));
                    console.log("Array after push : " + results);
                    console.log("executing after negated predicate ");
                    expect(homePage.mapLocation.getText()).toEqual('');
                    saveResultsToFile(results, done);
                }.bind(this));
            }.bind(this));


        }, 10000);
    });
});
