'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ipShipmentsPage = require('./pages/ip-shipments-page.js');
var ipWarehousePage = require('./pages/ip-warehouse-page.js');

describe('IP Deliveries', function () {

    var PO_NUMBER = '81026399';

    it('Set up to ensure that IP has items in their warehouse', function () {
        //TODO - Add IP delivery as a fixture so that this spec is not necessary

        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PO_NUMBER);
        directDeliveryPage.selectPurchaseOrderByNumber(PO_NUMBER);
        directDeliveryPage.selectSingleIP();

        directDeliveryPage.setConsignee('Wakiso');
        directDeliveryPage.setDeliveryDateForSingleIP('10/10/2021');
        directDeliveryPage.setContact('John');
        directDeliveryPage.setDistrict('Wakiso');

        directDeliveryPage.saveAndTrackDelivery();
        directDeliveryPage.confirmDelivery();

        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        ipShipmentsPage.visit();

        ipShipmentsPage.searchForShipment(PO_NUMBER);
        ipShipmentsPage.viewDeliveryDetails();
        ipShipmentsPage.specifyDeliveryAsReceived();
        ipShipmentsPage.specifyDeliveryReceiptDate('12/08/2015');
        ipShipmentsPage.specifyDeliveryConditionAsGood();
        ipShipmentsPage.specifyDeliverySatisfactionAsYes();
        ipShipmentsPage.saveAndProceedToItemsInDelivery();
        ipShipmentsPage.saveItemConfirmation();
    });

    it('should create a new delivery to a subconsignee', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        ipWarehousePage.visit();

        ipWarehousePage.searchForItem('kindle fire');
        ipWarehousePage.viewFirstItem();

        expect(ipWarehousePage.itemName).toBe('Item Name: Kindle Fire HDX');
        expect(ipWarehousePage.itemAvailableQty).toBe('Quantity Available: 500');

        ipWarehousePage.specifyShipmentDate('1');
        ipWarehousePage.specifyConsignee('Buikwe DHO');
        ipWarehousePage.specifyContact('John Doe');
        ipWarehousePage.specifyLocation('Buikwe');
        ipWarehousePage.markAsEndUser();
        ipWarehousePage.specifyQuantity('200');

        ipWarehousePage.saveDelivery();

        expect(ipWarehousePage.deliveryCount).toBe(1);
        expect(ipWarehousePage.deliveryQuantities).toContain('200');
        expect(ipWarehousePage.deliveryDates).toContain('01/01/2001');
        expect(ipWarehousePage.deliveryConsignees).toContain('BUIKWE DHO');
        expect(ipWarehousePage.deliveryContacts).toContain('John Doe');
        expect(ipWarehousePage.deliveryLocations).toContain('Buikwe');
    });

});
