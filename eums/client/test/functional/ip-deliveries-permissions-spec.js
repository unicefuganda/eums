'use strict';

var fs = require('fs');
var driver = require('');
var loginPage = require('./pages/login-page.js');
var commonPage = require('./pages/common-page.js');
var homePage = require('./pages/home-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Deliveries permission', function () {

    fit('Ip should not have the permission to view direct deliveries', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        console.log(new Date());
        directDeliveryPage.visit();
        console.log(new Date());

        //var EC = protractor.ExpectedConditions;
        //var modalControl = element(by.repeater('.ng-toast'));
        //var modal = EC.visibilityOf(modalControl);
        //browser.wait(modal, 5000, "Timeout when modal doesn't exit").then(function(){
        //    modal(toast.getText()).toEqual("Permission Denied!");
        //});
        browser.wait(element(by.repeater('message in messages')).isPresent);

        expect(commonPage.currentUrl).toEqual(homePage.url);

        console.log(new Date());

        element(by.repeater('message in messages')).then(function (toast) {
            console.log('expect(toast.getText()).toEqual("Permission Denied!");');
            expect(toast.getText()).toEqual("Permission Denied!");
        });
        console.log(new Date());


        //expect(homePage.toast.isDisplayed()).toBeTruthy();
        //expect(homePage.toastMessage).toEqual("Permission Denied!");
    });
});


