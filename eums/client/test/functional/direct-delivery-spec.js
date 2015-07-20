'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ipDirectDeliveryPage = require('./pages/ip-direct-delivery-page.js');
var header = require('./pages/header.js');

describe('Direct Delivery', function () {

    it('Admin should be able to create direct deliveries to multiple IPs', function () {

        loginPage.visit();

        loginPage.loginAs('admin', 'admin');

        directDeliveryPage.visit();

        var PURCHASE_ORDER_NUMBER = '81026395';

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

        header.logout();
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');

        ipDirectDeliveryPage.visit();
        ipDirectDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER);
        expect(ipDirectDeliveryPage.purchaseOrderCount).toEqual(1);
    });
});
