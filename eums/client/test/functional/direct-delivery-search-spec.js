'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliverySearchPage = require('./pages/direct-delivery-search-page.js');

fdescribe('Search Direct Delivery by Date range', function () {

    beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        directDeliverySearchPage.visit();
    });

    it('Search direct delivery by purchase order number', function () {
        directDeliverySearchPage.searchByPurchaseOrderNumber('81026395');
        directDeliverySearchPage.verifyPOExists('81026395');
        directDeliverySearchPage.clearPurchaseOrderNumber();
    });

    it('Search direct delivery by item description', function () {
        directDeliverySearchPage.searchByItemDescription("Children's Rights & Busi Principles Info");
        directDeliverySearchPage.verifyPOExists('81026395');
        directDeliverySearchPage.clearItemDescription();
    });

    it('Search direct delivery by outcome/programme', function () {
        directDeliverySearchPage.searchByProgramme("PCR: 123 - Test Outcome 1");
        directDeliverySearchPage.verifyPOExists('81026395');
        directDeliverySearchPage.clearProgramme();
    });

    it('Search direct delivery by district', function () {
        directDeliverySearchPage.searchByDistrict("Oyam");
        directDeliverySearchPage.verifyPOExists('12345');
        directDeliverySearchPage.clearDistrict();
    });

    it('Search direct delivery by IP', function () {
        directDeliverySearchPage.searchByIP("GULU DHO");
        directDeliverySearchPage.verifyPOExists('12345');
        directDeliverySearchPage.clearIP();
    });

    it('Search direct delivery by from date', function () {
        directDeliverySearchPage.searchByFromDate('11-Jul-2015');
        directDeliverySearchPage.verifyPOExists('12345');
        directDeliverySearchPage.clearFromDate();
    });

    it('Search direct delivery by to date', function () {
        directDeliverySearchPage.searchByToDate('21-Jul-2015');
        directDeliverySearchPage.verifyPOExists('81026395');
        directDeliverySearchPage.clearToDate();
    });

    it('Search direct delivery by date range from-to', function () {
        directDeliverySearchPage.clearFromDate();
        directDeliverySearchPage.clearToDate();
        directDeliverySearchPage.searchByFromDate('12-Jul-2015');
        directDeliverySearchPage.searchByToDate('21-Jul-2015');
        directDeliverySearchPage.verifyPOExists('81026395');
    })
});
