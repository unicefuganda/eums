'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliverySearchPage = require('./pages/direct-delivery-search-page.js');

describe('Search Direct Delivery by Date range', function () {


    beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        directDeliverySearchPage.visit();
    });

    it('Search Direct Delivery by From Date', function () {
       directDeliverySearchPage.searchFromDate('17-Sept-2015');
       directDeliverySearchPage.verifyPOExists('81029906');
       directDeliverySearchPage.clearFromDate();


    });

    it('Search Direct Delivery by To Date', function () {

        directDeliverySearchPage.searchToDate('03-Dec-2014');
        directDeliverySearchPage.verifyPOExists('81026395');
        directDeliverySearchPage.clearToDate();


    });
    it('Search Direct Delivery by Date Range From-To', function(){
        directDeliverySearchPage.clearFromDate();
        directDeliverySearchPage.clearToDate();
        directDeliverySearchPage.searchFromDate('03-Dec-2014');
        directDeliverySearchPage.searchToDate('03-Dec-2014');
        directDeliverySearchPage.verifyPOExists('81026395');



    })


});
