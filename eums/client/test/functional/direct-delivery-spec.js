'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var ipDirectDeliveryPage = require('./pages/ip-direct-delivery-page.js');
var consigneesPage = require('./pages/consignees-page.js');

describe('Direct Delivery', function () {

    var PURCHASE_ORDER_NUMBER1 = '81026395';
    var PURCHASE_ORDER_NUMBER2 = '81029906';

    it('Admin should be able to create direct deliveries to multiple IPs', function () {

        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        directDeliveryPage.visit();

        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER1);
        expect(directDeliveryPage.firstPurchaseOrderAttributes).toContain('text-danger');

        directDeliveryPage.selectPurchaseOrderByNumber(PURCHASE_ORDER_NUMBER1);
        directDeliveryPage.selectMultipleIP();
        directDeliveryPage.selectItem('How Business Affects Us');

        directDeliveryPage.addConsignee();

        directDeliveryPage.setQuantity(100);
        directDeliveryPage.setDeliveryDate('10/10/2021');
        directDeliveryPage.setConsignee('WAKISO');
        directDeliveryPage.setContact('John');
        directDeliveryPage.setDistrict('Wakiso');

        directDeliveryPage.saveDelivery();
        directDeliveryPage.confirmDelivery();

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER1);
        expect(directDeliveryPage.firstPurchaseOrderAttributes).toContain('text-warning');
    });

    it('IP should be able to see direct delivery created by admin and add consignees while reporting', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');

        ipDirectDeliveryPage.visit();
        ipDirectDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER1);
        expect(ipDirectDeliveryPage.purchaseOrderCount).toEqual(1);

        ipDirectDeliveryPage.selectPurchaseOrderByNumber(PURCHASE_ORDER_NUMBER1);
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

    it('Admin should be able to create a direct delivery to a single IP', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER2);
        directDeliveryPage.selectPurchaseOrderByNumber(PURCHASE_ORDER_NUMBER2);
        directDeliveryPage.selectSingleIP();

        expect(directDeliveryPage.purchaseOrderType).toContain('ZLC');
        expect(directDeliveryPage.purchaseOrderTotalValue).toContain('$1,093.26');
        expect(directDeliveryPage.purchaseOrderItemCount).toEqual(4);

        expect(directDeliveryPage.purchaseOrderItemMaterialNumbers).toContain('SL009122');
        expect(directDeliveryPage.purchaseOrderItemDescriptions).toContain('Ess. Package for HS - CSZ Som Ver.');
        expect(directDeliveryPage.purchaseOrderItemQuantities).toContain('1000.00');
        expect(directDeliveryPage.purchaseOrderItemValues).toContain('$327.98');
        expect(directDeliveryPage.purchaseOrderItemBalances).toContain('1000');
        expect(directDeliveryPage.purchaseOrderItemDeliveryValues).toContain('$327.98');


        directDeliveryPage.saveDraftDelivery();
        expect(directDeliveryPage.toastMessage).toContain('Cannot save. Please fill out or fix values for all fields marked in red');

        directDeliveryPage.saveAndTrackDelivery();
        expect(directDeliveryPage.toastMessage).toContain('Cannot save. Please fill out or fix values for all fields marked in red');

        directDeliveryPage.setConsignee('Wakiso');
        directDeliveryPage.setDeliveryDateForSingleIP('10/10/2021');
        directDeliveryPage.setContact('John');
        directDeliveryPage.setDistrict('Wakiso');

        directDeliveryPage.firstRowQuantityShipped.clear().sendKeys('999999');

        directDeliveryPage.saveDraftDelivery();
        expect(directDeliveryPage.toastMessage).toContain('Cannot save. Please fill out or fix values for all fields marked in red');

        directDeliveryPage.firstRowQuantityShipped.clear().sendKeys('125');
        expect(directDeliveryPage.purchaseOrderItemDeliveryValues).toContain('$41.00');

        directDeliveryPage.saveDraftDelivery();
        directDeliveryPage.confirmDelivery();

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER2);
        directDeliveryPage.selectPurchaseOrderByNumber(PURCHASE_ORDER_NUMBER2);

        expect(directDeliveryPage.purchaseOrderQuantities).toContain('125');
        expect(directDeliveryPage.purchaseOrderItemDeliveryValues).toContain('$41.00');

        directDeliveryPage.saveAndTrackDelivery();
        expect(directDeliveryPage.purchaseOrderItemBalances).toContain('875');
        expect(directDeliveryPage.purchaseOrderQuantities).toContain('875');
        expect(directDeliveryPage.purchaseOrderItemDeliveryValues).toContain('$286.98');

        expect(directDeliveryPage.purchaseOrderItemBalances).toContain('0');
        expect(directDeliveryPage.purchaseOrderQuantities).toContain('0');
        expect(directDeliveryPage.purchaseOrderItemDeliveryValues).toContain('$0.00');

        expect(directDeliveryPage.previousDeliveryDates).toContain('10 Oct 2021');
        expect(directDeliveryPage.previousDeliveryTotalValues).toContain('$806.28');

        directDeliveryPage.viewFirstPreviousDelivery();
        expect(directDeliveryPage.deliveryModalMaterialNumbers).toContain('SL009123');
        expect(directDeliveryPage.deliveryModalItemDescriptions).toContain('Complete Imm. Schedule - CSZ Eng Ver.');
        expect(directDeliveryPage.deliveryModalDeliveriedQuantities).toContain('200');
        expect(directDeliveryPage.deliveryModalItemValues).toContain('$218.65');

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER2);
        expect(directDeliveryPage.firstPurchaseOrderAttributes).toContain('text-warning');
    });
});
