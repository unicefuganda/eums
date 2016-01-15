'use strict';

var loginPage = require('./pages/login-page.js');
var warehouseDeliverySearchPage = require('./pages/warehouse-delivery-search-page.js');

describe('Search Delivery by Date range', function () {

    beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        warehouseDeliverySearchPage.visit();
    });

    it('Search warehouse delivery by waybill number', function () {
        warehouseDeliverySearchPage.searchByWaybill('72089797');
        warehouseDeliverySearchPage.verifyROExists('72089797');
        warehouseDeliverySearchPage.clearWaybill();
    });

    it('Search warehouse delivery by item description', function () {
        warehouseDeliverySearchPage.searchByItemDescription("Birth Cushion set");
        warehouseDeliverySearchPage.verifyROExists('72082647');
        warehouseDeliverySearchPage.clearItemDescription();
    });

    it('Search warehouse delivery by outcome/programme', function () {
        warehouseDeliverySearchPage.searchByProgramme("PCR: 123 - Test Outcome 1");
        warehouseDeliverySearchPage.verifyROExists('72077574');
        warehouseDeliverySearchPage.clearProgramme();
    });

    it('Search warehouse delivery by district', function () {
        warehouseDeliverySearchPage.searchByDistrict("Wakiso");
        warehouseDeliverySearchPage.verifyROExists('72077574');
        warehouseDeliverySearchPage.clearDistrict();
    });

    it('Search warehouse delivery by IP', function () {
        warehouseDeliverySearchPage.searchByIP("ARUA DHO DR. ANGUZU PATRICK");
        warehouseDeliverySearchPage.verifyROExists('72077574');
        warehouseDeliverySearchPage.clearIP();
    });

    it('Search warehouse delivery by from date', function () {
        warehouseDeliverySearchPage.searchByFromDate('06-11-2014');
        warehouseDeliverySearchPage.verifyROExists('72089797');
        warehouseDeliverySearchPage.clearFromDate();
    });

    it('Search warehouse delivery by to date', function () {
        warehouseDeliverySearchPage.searchByToDate('18/11/2014');
        warehouseDeliverySearchPage.verifyROExists('72090975');
        warehouseDeliverySearchPage.clearToDate();
    });

    it('Search warehouse Delivery by date range from-to', function () {
        warehouseDeliverySearchPage.clearFromDate();
        warehouseDeliverySearchPage.clearToDate();
        warehouseDeliverySearchPage.searchByFromDate('06-11-2014');
        warehouseDeliverySearchPage.searchByToDate('18/11/2014');
        warehouseDeliverySearchPage.verifyROExists('72089797');
        warehouseDeliverySearchPage.verifyROExists('72090975');
    })
});
