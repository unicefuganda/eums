'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ipDirectDeliveryPage = require('./pages/ip-direct-delivery-page.js');
var consigneesPage = require('./pages/consignees-page.js');

describe('Direct Delivery', function () {

    var PURCHASE_ORDER_NUMBER = '81026395';

    it('Admin should be able to create direct deliveries to multiple IPs', function () {

        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        directDeliveryPage.visit();

        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER);
        expect(directDeliveryPage.firstPurchaseOrderAttributes).toContain('text-danger');

        directDeliveryPage.selectPurchaseOrderByNumber(PURCHASE_ORDER_NUMBER);
        directDeliveryPage.selectMultipleIP();
        directDeliveryPage.selectItem('How Business Affects Us');

        directDeliveryPage.addConsignee();
        directDeliveryPage.setQuantity(100);
        directDeliveryPage.setDeliveryDate('10/10/2021');
        directDeliveryPage.setConsignee('WAKISO');
        directDeliveryPage.setContact('John');
        directDeliveryPage. setDistrict('Wakiso');
        directDeliveryPage.saveDelivery();
        directDeliveryPage.confirmDelivery();

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER);
        expect(directDeliveryPage.firstPurchaseOrderAttributes).toContain('text-warning');
    });

    it('IP should be able to see direct delivery created by admin and add consignees while reporting', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');

        ipDirectDeliveryPage.visit();
        ipDirectDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER);
        expect(ipDirectDeliveryPage.purchaseOrderCount).toEqual(1);

        ipDirectDeliveryPage.selectPurchaseOrderByNumber(PURCHASE_ORDER_NUMBER);
        ipDirectDeliveryPage.selectItem('How Business Affects Us');
        ipDirectDeliveryPage.addNewConsignee();

        ipDirectDeliveryPage.setConsigneeName('Fresh Consignee');
        ipDirectDeliveryPage.setConsigneeLocation('Fresh Location');
        ipDirectDeliveryPage.setConsigneeRemarks('Fresh Remarks');
        ipDirectDeliveryPage.saveConsignee();

        consigneesPage.visit();
        consigneesPage.searchFor('Fresh Consignee');
        expect(consigneesPage.consigneeNames).toContain('Fresh Consignee');
        expect(consigneesPage.consigneeLocations).toContain('Fresh Location');
        expect(consigneesPage.consigneeIDs).toContain('');
        expect(consigneesPage.consigneeRemarks).toContain('Fresh Remarks');
    });
});
