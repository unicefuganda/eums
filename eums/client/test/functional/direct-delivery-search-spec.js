'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliverySearchPage = require('./pages/direct-delivery-search-page.js');

xdescribe('Search Direct Delivery by Date range', function () {


    beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        directDeliverySearchPage.visit();
    });

    it('Search Direct Delivery by From Date', function () {
       directDeliverySearchPage.searchFromDate('11-Jul-2015');
       directDeliverySearchPage.verifyPOExists('12345');
       directDeliverySearchPage.clearFromDate();


    });

    it('Search Direct Delivery by To Date', function () {

        directDeliverySearchPage.searchToDate('21-Jul-2015');
        directDeliverySearchPage.verifyPOExists('81026395');
        directDeliverySearchPage.clearToDate();


    });
    it('Search Direct Delivery by Date Range From-To', function(){
        directDeliverySearchPage.clearFromDate();
        directDeliverySearchPage.clearToDate();
        directDeliverySearchPage.searchFromDate('12-Jul-2015');
        directDeliverySearchPage.searchToDate('21-Jul-2015');
        directDeliverySearchPage.verifyPOExists('81026395');



    })


});
