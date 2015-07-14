'use strict';

var loginPage = require('./pages/login-page.js');
var warehouseDeliveryPage = require('./pages/warehouse-delivery-page.js');
var ipWarehouseDeliveryPage = require('./pages/ip-warehouse-delivery-page.js');
var header = require('./pages/header.js');

describe('Warehouse Delivery', function () {

    it('Admin should be able to create warehouse delivery to an IP', function () {

        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        warehouseDeliveryPage.visit();

        var WAYBILLNUMBER = '72082647';

        warehouseDeliveryPage.searchForThisWaybill(WAYBILLNUMBER);
        expect(warehouseDeliveryPage.firstReleaseOrderAttributes).toContain('text-warning');

        warehouseDeliveryPage.selectWaybillByNumber(WAYBILLNUMBER);

        warehouseDeliveryPage.selectContact('John');
        warehouseDeliveryPage.selectLocation('wakiso');
        warehouseDeliveryPage.saveDelivery();

        warehouseDeliveryPage.visit();
        warehouseDeliveryPage.searchForThisWaybill(WAYBILLNUMBER);
        expect(warehouseDeliveryPage.firstReleaseOrderAttributes).toContain('text-success');

        header.logout();
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');

        ipWarehouseDeliveryPage.visit();
        ipWarehouseDeliveryPage.searchForThisWaybill(WAYBILLNUMBER);
        expect(warehouseDeliveryPage.waybillCount).toEqual(1);
    });

});
