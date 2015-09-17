'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ipShipmentsPage = require('./pages/ip-shipments-page.js');
var ipWarehousePage = require('./pages/ip-warehouse-page.js');
var ipShipmentDelivery = require('./pages/direct-ip-delivery-search-page.js');

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
        ipWarehousePage.reportOnFirstItem();

        expect(ipWarehousePage.itemName).toBe('Item Name: Kindle Fire HDX');
        expect(ipWarehousePage.itemAvailableQty).toBe('Quantity Available: 500');

        ipWarehousePage.specifyShipmentDate('1');
        ipWarehousePage.specifyConsignee('Buikwe DHO');
        ipWarehousePage.specifyContact('John');
        ipWarehousePage.specifyLocation('Buikwe');
        ipWarehousePage.specifyQuantity('200');

        ipWarehousePage.saveDelivery();

        expect(ipWarehousePage.deliveryCount).toBe(1);
        expect(ipWarehousePage.deliveryQuantities).toContain('200');
        expect(ipWarehousePage.deliveryDates).toContain('01/01/2001');
        expect(ipWarehousePage.deliveryConsignees).toContain('BUIKWE DHO');
        expect(ipWarehousePage.deliveryContacts).toContain('John Doe');
        expect(ipWarehousePage.deliveryLocations).toContain('Buikwe');
    });

    it('should create a new delivery to an end-user', function () {
        ipWarehousePage.visit();
        ipWarehousePage.searchForItem('kindle fire');
        ipWarehousePage.viewFirstItem();

        ipWarehousePage.createNewDelivery();
        expect(ipWarehousePage.itemName).toBe('Item Name: Kindle Fire HDX');
        expect(ipWarehousePage.itemAvailableQty).toBe('Quantity Available: 300');
        ipWarehousePage.discardDelivery();

        ipWarehousePage.viewSubconsignees();
        expect(ipWarehousePage.itemAvailableQty).toBe('Quantity Available: 200');

        ipWarehousePage.addSubconsignee();

        ipWarehousePage.specifyQuantity('150');
        ipWarehousePage.specifyShipmentDate('1');
        ipWarehousePage.specifyConsignee('Agago DHO');
        ipWarehousePage.specifyContact('John');
        ipWarehousePage.specifyLocation('Agago');
        ipWarehousePage.markAsEndUser();

        ipWarehousePage.saveDelivery();

        expect(ipWarehousePage.subDeliveryCount).toBe(1);
        expect(ipWarehousePage.subDeliveryQuantities).toContain('150');
        expect(ipWarehousePage.subDeliveryDates).toContain('01/01/2001');
        expect(ipWarehousePage.subDeliveryConsignees).toContain('AGAGO DHO');
        expect(ipWarehousePage.subDeliveryContacts).toContain('John Doe');
        expect(ipWarehousePage.subDeliveryLocations).toContain('Agago');
    });

    it('Search for IP Delivery by To  and From Date', function(){
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        ipShipmentDelivery.visit();
        ipShipmentDelivery.searchFromDate('10/02/2020');
        ipShipmentDelivery.searchToDate('10/02/2031')
        ipShipmentDelivery.clickOutSideToChangeFocus();
        //ipShipmentDelivery.verifyPOExists('81026399');

    });

});
