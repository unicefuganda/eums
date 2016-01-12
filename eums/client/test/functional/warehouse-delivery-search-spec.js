'use strict';

var loginPage = require('./pages/login-page.js');
var warehouseDeliverySearchPage = require('./pages/warehouse-delivery-search-page.js');

describe('Search Delivery by Date range', function () {

    beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        warehouseDeliverySearchPage.visit();
    });

    it('Search Warehouse Delivery by From Date', function () {
        warehouseDeliverySearchPage.searchFromDate('06-11-2014');
        warehouseDeliverySearchPage.verifyPOExists('72089797');
        warehouseDeliverySearchPage.clearFromDate();
    });

    it('Search Warehouse Delivery by To Date', function () {
        warehouseDeliverySearchPage.searchToDate('18/11/2014');
        warehouseDeliverySearchPage.verifyPOExists('72090975');
        warehouseDeliverySearchPage.clearToDate();
    });

    it('Search warehouse Delivery by Date Range From-To', function () {
        warehouseDeliverySearchPage.clearFromDate();
        warehouseDeliverySearchPage.clearToDate();
        warehouseDeliverySearchPage.searchFromDate('06-11-2014');
        warehouseDeliverySearchPage.searchToDate('18/11/2014');
        warehouseDeliverySearchPage.verifyPOExists('72089797');
        warehouseDeliverySearchPage.verifyPOExists('72090975');
    })
});
