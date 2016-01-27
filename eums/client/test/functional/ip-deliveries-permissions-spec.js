'use strict';

var fs = require('fs');
var loginPage = require('./pages/login-page.js');
var commonPage = require('./pages/common-page.js');
var homePage = require('./pages/home-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Deliveries permission', function () {

    it('Ip should not have the permission to view direct deliveries', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        directDeliveryPage.visit();

        expect(commonPage.currentUrl).toEqual(homePage.url);
    });
});


