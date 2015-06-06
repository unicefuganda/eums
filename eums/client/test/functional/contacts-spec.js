'use strict';

describe('contacts page', function () {
    var loginPage;

    function waitForPromiseTest(promiseFn, testFn) {
        browser.wait(function () {
            var deferred = protractor.promise.defer();
            promiseFn().then(function (data) {
                deferred.fulfill(testFn(data));
            });
            return deferred.promise;
        });
    }



    function waitForPredicate(predicate, target){
        //browser.wait(function () {
        //    return elm.isPresent();
        //},10000);
        //browser.wait(function () {
        //    return elm.isDisplayed();
        //},10000);

        browser.wait(function () {
            return predicate().then(function(value){return value;});
        }.bind(this), 5000).then(function(){
            console.log("predicate set. calling target ");
            target();
        }.bind(this), function(err){
            console.log("Timeout occured Abe");
        });


        //browser.wait(function() {
        //    var deferred = protractor.promise.defer();
        //    element(by.id('some-element')).isPresent()
        //        .then(function (isPresent) {
        //            deferred.fulfill(!isPresent);
        //        });
        //    return deferred.promise;
        //});
    }



    beforeEach(function () {
        loginPage = require('./pages/login-page');
        browser.ignoreSynchronization = true;
        browser.get('/');
        loginPage.loginWithCredentials('admin', 'admin');

    });

    afterEach(function () {
        loginPage.logout();
    });

    iit('should go to the contacts page', function () {
        //FIXME need to remove these arbitrary waits. They make tests either flaky or unnecessarily long
        waitForPredicate(element(by.id('admin-nav')).isElementPresent, function(){console.log("target called!")})

        waitForPromiseTest(element(by.id('admin-nav')).isPresent,
            function (isPresent) {
                return !isPresent;
            }).then(console.log("Duude is present"));

        //browser.sleep(5000);
        element(by.id('admin-nav')).click();
        waitForPredicate(element(by.id('contact-nav')).isElementPresent, function(){console.log("target2 called!")})
        element(by.id('contact-nav')).click();
        //browser.sleep(5000);
        waitForPredicate(element(by.css('.page-header')).isElementPresent, function(){console.log("target3 called!")})
        expect(element(by.css('.page-header')).getText()).toEqual('Contacts');
        expect(element(by.id('add-contact')).getText()).toEqual('Add Contact');
    });
});