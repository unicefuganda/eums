'use strict';

var loginPage = require('./pages/login-page.js');
var warehouseDeliveryPage = require('./pages/warehouse-delivery-page.js');
var ipWarehouseDeliveryPage = require('./pages/ip-warehouse-delivery-page.js');
var confirmItemByItem = require('./pages/ip-items-deliveries-page.js');
var header = require('./pages/header.js');
var WAYBILL_NUMBER;
describe('Warehouse Delivery', function () {

    beforeEach(function () {
        loginPage.visit();
        WAYBILL_NUMBER = '72082647';
    });

    it('Admin should be able to create warehouse delivery to an IP', function () {
        loginPage.loginAs('admin', 'admin');
        warehouseDeliveryPage.visit();

        warehouseDeliveryPage.searchForThisWaybill(WAYBILL_NUMBER);
        expect(warehouseDeliveryPage.firstReleaseOrderAttributes).toContain('text-warning');

        warehouseDeliveryPage.selectWaybillByNumber(WAYBILL_NUMBER);

        warehouseDeliveryPage.selectContact('John');
        warehouseDeliveryPage.selectLocation('wakiso');
        //TODO Make sure this can be tested without relying on redis
        warehouseDeliveryPage.enableTracking();
        warehouseDeliveryPage.saveDelivery();

        warehouseDeliveryPage.visit();
        warehouseDeliveryPage.searchForThisWaybill(WAYBILL_NUMBER);
        expect(warehouseDeliveryPage.firstReleaseOrderAttributes).toContain('text-success');
    });

    it('IP should be able to confirm Waybill delivery', function () {
        loginPage.loginAs('wakiso', 'wakiso');
        ipWarehouseDeliveryPage.visit();
        ipWarehouseDeliveryPage.searchForThisWaybill(WAYBILL_NUMBER);
        ipWarehouseDeliveryPage.confirmDelivery();
        ipWarehouseDeliveryPage.selectAnswer();
        ipWarehouseDeliveryPage.deliveryDate();
        ipWarehouseDeliveryPage.itemCondition();
        ipWarehouseDeliveryPage.satisfiedByItem();
        ipWarehouseDeliveryPage.extraComment();
        ipWarehouseDeliveryPage.confirmItems();
        confirmItemByItem.isItemReceived();
        confirmItemByItem.itemCondition();
        confirmItemByItem.satisfiedByItem();
        confirmItemByItem.enterRemarks();
        confirmItemByItem.waitForModalToLoad();
        confirmItemByItem.saveRemarks();
        confirmItemByItem.exitRemarksModal();
        confirmItemByItem.waitForModalToExit();
        confirmItemByItem.saveItems();

    });
});
