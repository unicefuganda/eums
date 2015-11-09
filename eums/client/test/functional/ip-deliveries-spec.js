'use strict';

var loginPage = require('./pages/login-page.js');
var ftUtils = require('./functional-test-utils.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ipShipmentsPage = require('./pages/ip-shipments-page.js');
var ipWarehousePage = require('./pages/ip-warehouse-page.js');
var ipShipmentDelivery = require('./pages/direct-ip-delivery-search-page.js');

describe('IP Deliveries', function () {

    var PO_NUMBER = '81026399';

    it('Set up to ensure that IP has items in their warehouse', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PO_NUMBER);
        directDeliveryPage.selectPurchaseOrderByNumber(PO_NUMBER);
        directDeliveryPage.selectSingleIP();

        directDeliveryPage.setConsignee('Wakiso');
        directDeliveryPage.setDeliveryDateForSingleIP('10-Oct-2021');
        directDeliveryPage.setContact('John');
        directDeliveryPage.setDistrict('Wakiso');

        directDeliveryPage.saveAndTrackDelivery();
        expect(directDeliveryPage.toastMessage).toContain('Delivery created');

        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        ipShipmentsPage.visit();

        ipShipmentsPage.searchForShipment(PO_NUMBER);
        ipShipmentsPage.viewDeliveryDetails();
        ipShipmentsPage.specifyDeliveryAsReceived();
        ipShipmentsPage.specifyDeliveryReceiptDate('12-Aug-2015');
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
        ftUtils.wait(2000);
        ipWarehousePage.reportOnFirstItem();

        expect(ipWarehousePage.itemName).toBe('Item Name: Kindle Fire HDX');
        expect(ipWarehousePage.itemAvailableQty).toBe('Quantity Available: 500');

        expect(ipWarehousePage.notificationWarning.isDisplayed()).toBeTruthy();

        ipWarehousePage.specifyShipmentDate('1');
        ipWarehousePage.specifyConsignee('Buikwe DHO');
        ipWarehousePage.specifyContact('John');
        ipWarehousePage.specifyLocation('Buikwe');
        ipWarehousePage.specifyQuantity('200');

        ipWarehousePage.saveDelivery();

        expect(ipWarehousePage.deliveryCount).toBe(1);
        expect(ipWarehousePage.deliveryQuantities).toContain('200');
        expect(ipWarehousePage.deliveryDates).toContain('01-Jan-2001');
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

        expect(ipWarehousePage.notificationWarning.isDisplayed()).toBeTruthy();

        ipWarehousePage.specifyQuantity('150');
        ipWarehousePage.specifyShipmentDate('1');
        ipWarehousePage.specifyConsignee('Agago DHO');
        ipWarehousePage.specifyContact('John');
        ipWarehousePage.specifyLocation('Agago');
        ipWarehousePage.markAsEndUser();

        ipWarehousePage.saveDelivery();
        expect(directDeliveryPage.toastMessage).toContain('Delivery Successfully Created');

        expect(ipWarehousePage.subDeliveryCount).toBe(1);
        expect(ipWarehousePage.subDeliveryQuantities).toContain('150');
        expect(ipWarehousePage.subDeliveryDates).toContain('01-Jan-2001');
        expect(ipWarehousePage.subDeliveryConsignees).toContain('AGAGO DHO');
        expect(ipWarehousePage.subDeliveryContacts).toContain('John Doe');
        expect(ipWarehousePage.subDeliveryLocations).toContain('Agago');
    });

    it('Search for IP Delivery by To and From Date', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        ipShipmentDelivery.visit();
        ipShipmentDelivery.searchFromDate('10-Feb-2020');
        ipShipmentDelivery.searchToDate('10-Feb-2031');
    });

    it('should have breadcrumbs for navigation', function () {
        ipWarehousePage.visit();
        ipWarehousePage.searchForItem('kindle fire');
        ipWarehousePage.viewFirstItem();

        ipWarehousePage.viewSubconsignees();
        expect(ipWarehousePage.breadCrumbs.count()).toEqual(2);
        expect(ipWarehousePage.breadCrumbs.get(0).getText()).toBe('Kindle Fire HDX');
        expect(ipWarehousePage.breadCrumbs.get(0).element(by.css('a')).getAttribute('href')).toBe(ipWarehousePage.fullUrl('/#/deliveries-by-ip/285'));
        expect(ipWarehousePage.breadCrumbs.get(1).getText()).toBe('BUIKWE DHO');
        expect(ipWarehousePage.breadCrumbs.get(1).element(by.css('span')).getText()).toBe('BUIKWE DHO');

        ipWarehousePage.addSubconsignee();

        ipWarehousePage.specifyQuantity('20');
        ipWarehousePage.specifyShipmentDate('1');
        ipWarehousePage.specifyConsignee('ADJUMANI DHO');
        ipWarehousePage.specifyContact('John');
        ipWarehousePage.specifyLocation('Adjumani');

        ipWarehousePage.saveDelivery();
        ftUtils.wait(10000);

        ipWarehousePage.searchForItem('Adjumani');
        ipWarehousePage.viewFirstSubconsignee();
        expect(ipWarehousePage.breadCrumbs.count()).toEqual(3);
        expect(ipWarehousePage.breadCrumbs.get(0).getText()).toBe('Kindle Fire HDX');
        expect(ipWarehousePage.breadCrumbs.get(0).element(by.css('a')).getAttribute('href')).toBe(ipWarehousePage.fullUrl('/#/deliveries-by-ip/285'));
        expect(ipWarehousePage.breadCrumbs.get(1).getText()).toBe('BUIKWE DHO');
        expect(ipWarehousePage.breadCrumbs.get(1).element(by.css('a')).getAttribute('href')).toContain(ipWarehousePage.fullUrl('/#/deliveries-by-ip/285/'));
        expect(ipWarehousePage.breadCrumbs.get(1).element(by.css('a')).getAttribute('href')).toContain('/new');
        expect(ipWarehousePage.breadCrumbs.get(2).getText()).toBe('ADJUMANI DHO');
        expect(ipWarehousePage.breadCrumbs.get(2).element(by.css('span')).getText()).toBe('ADJUMANI DHO');
    });

});
