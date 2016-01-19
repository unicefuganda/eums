'use strict';

var fs = require('fs');
var loginPage = require('./pages/login-page.js');
var commonPage = require('./pages/common-page.js');
var homePage = require('./pages/home-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Deliveries permission', function () {

    fit('Ip should not have the permission to view direct deliveries', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        directDeliveryPage.visit();

        expect(commonPage.currentUrl).toEqual(homePage.url);

        // TODO:assert the toast message
        //element(by.repeater('message in messages')).then(function (toast) {
        //    console.log('expect(toast.getText()).toEqual("Permission Denied!");');
        //    expect(toast.getText()).toEqual("Permission Denied!");
        //});

        //expect(homePage.toast.isDisplayed()).toBeTruthy();
        //expect(homePage.toastMessage).toEqual("Permission Denied!");
    });
});


