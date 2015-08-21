'use strict';

var loginPage = require('./pages/login-page.js');
var warehouseDeliveryPage = require('./pages/warehouse-delivery-page.js');
var header = require('./pages/header.js');

describe('Warehouse Delivery', function () {

    it('Admin should be able to create warehouse delivery to an IP', function () {

        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        warehouseDeliveryPage.visit();

        var WAYBILL_NUMBER = '72082647';

        warehouseDeliveryPage.searchForThisWaybill(WAYBILL_NUMBER);
        expect(warehouseDeliveryPage.firstReleaseOrderAttributes).toContain('text-warning');

        warehouseDeliveryPage.selectWaybillByNumber(WAYBILL_NUMBER);

        warehouseDeliveryPage.selectContact('John');
        warehouseDeliveryPage.selectLocation('wakiso');
        warehouseDeliveryPage.enableTracking();
        warehouseDeliveryPage.saveDelivery();

        warehouseDeliveryPage.visit();
        warehouseDeliveryPage.searchForThisWaybill(WAYBILL_NUMBER);
        expect(warehouseDeliveryPage.firstReleaseOrderAttributes).toContain('text-success');
    });
});
