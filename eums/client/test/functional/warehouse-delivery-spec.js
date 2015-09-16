'use strict';

var loginPage = require('./pages/login-page.js');
var warehouseDeliveryPage = require('./pages/warehouse-delivery-page.js');
var ipShipmentsPage = require('./pages/ip-shipments-page.js');
var ipWarehousePage = require('./pages/ip-warehouse-page.js');

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

    it('Condition and satisfaction responses should assume the appropriate defaults', function () {
        loginPage.loginAs('wakiso', 'wakiso');
        ipShipmentsPage.visit();
        ipShipmentsPage.searchForShipment(WAYBILL_NUMBER);
        ipShipmentsPage.viewDeliveryDetails();
        ipShipmentsPage.specifyDeliveryAsReceived();
        ipShipmentsPage.specifyDeliveryReceiptDate('10/08/2015');
        ipShipmentsPage.specifyDeliveryConditionAsGood();
        ipShipmentsPage.specifyDeliverySatisfactionAsNo();
        ipShipmentsPage.saveAndProceedToItemsInDelivery();

        expect(ipShipmentsPage.itemConditions).toContain('Good');
        expect(ipShipmentsPage.itemSatisfactions).toContain('No');

        ipShipmentsPage.goBackToShipmentsPage();
        ipShipmentsPage.searchForShipment(WAYBILL_NUMBER);
        ipShipmentsPage.viewDeliveryDetails();
        ipShipmentsPage.specifyDeliveryReceiptDate('10/08/2015');
        ipShipmentsPage.specifyDeliveryConditionAsNotGood();
        ipShipmentsPage.specifyDeliverySatisfactionAsNo();
        ipShipmentsPage.saveAndProceedToItemsInDelivery();

        expect(ipShipmentsPage.itemConditions).toContain('Select');
        expect(ipShipmentsPage.itemSatisfactions).toContain('No');

    });

    it('IP should be able to confirm Waybill delivery', function () {
        loginPage.loginAs('wakiso', 'wakiso');
        ipShipmentsPage.visit();

        ipShipmentsPage.searchForShipment(WAYBILL_NUMBER);
        ipShipmentsPage.viewDeliveryDetails();
        ipShipmentsPage.specifyDeliveryReceiptDate('10/08/2015');
        ipShipmentsPage.specifyDeliveryConditionAsGood();
        ipShipmentsPage.specifyDeliverySatisfactionAsYes();
        ipShipmentsPage.addRemarks('The delivery was good');
        ipShipmentsPage.saveAndProceedToItemsInDelivery();

        expect(ipShipmentsPage.itemConditions).toContain('Good');
        expect(ipShipmentsPage.itemSatisfactions).toContain('Yes');

        var itemRowIndex = 0;
        ipShipmentsPage.specifyItemReceived(itemRowIndex, 'Yes');
        ipShipmentsPage.specifyQtyReceived(itemRowIndex, 50);
        ipShipmentsPage.specifyItemCondition(itemRowIndex, 'Good');
        ipShipmentsPage.specifyItemSatisfaction(itemRowIndex, 'Yes');
        ipShipmentsPage.addItemRemark(itemRowIndex, 'All Good');

        ipShipmentsPage.saveItemConfirmation();
    });

    it('Acknowledged items are displayed in the IPs warehouse', function () {
        ipWarehousePage.visit();

        ipWarehousePage.searchForItem('birth cushion');
        expect(ipWarehousePage.warehouseItemCount).not.toEqual(0);
        expect(ipWarehousePage.itemDescriptions).toContain('Birth Cushion set');
        expect(ipWarehousePage.itemBalances).toContain('50');
    });
});
