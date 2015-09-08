'use strict';

var loginPage = require('./pages/login-page.js');
var warehouseDeliveryPage = require('./pages/warehouse-delivery-page.js');
var confirmItemByItem = require('./pages/ip-items-deliveries-page.js');
var ipShipmentsPage = require('./pages/ip-shipments-page.js');

describe('Warehouse Delivery', function () {

    var WAYBILL_NUMBER = '72082647';

    beforeEach(function () {
        loginPage.visit();
    });

    it('Admin should be able to create warehouse delivery to an IP', function () {
        loginPage.loginAs('admin', 'admin');
        warehouseDeliveryPage.visit();

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

    it('IP should be able to confirm Waybill delivery', function () {
        loginPage.loginAs('wakiso', 'wakiso');
        ipShipmentsPage.visit();

        ipShipmentsPage.searchForShipment(WAYBILL_NUMBER);
        ipShipmentsPage.viewDeliveryDetails();
        ipShipmentsPage.specifyDeliveryAsReceived();
        ipShipmentsPage.specifyDeliveryReceiptDate('10/08/2015');
        ipShipmentsPage.specifyDeliveryConditionAsGood();
        ipShipmentsPage.specifyDeliverySatisfactionAsYes();
        ipShipmentsPage.addRemarks('The delivery was good');
        ipShipmentsPage.saveAndProceedToItemsInDelivery();

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
