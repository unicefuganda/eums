'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var contactsPage = require('./pages/contacts-page.js');
var ipShipmentsPage = require('./pages/ip-shipments-page.js');
var alertsPage = require('./pages/alerts-page.js');

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
        directDeliveryPage.enableTracking();

        directDeliveryPage.saveDelivery();
        directDeliveryPage.confirmDelivery();

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER1);
        expect(directDeliveryPage.firstPurchaseOrderAttributes).toContain('text-warning');
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

        contactsPage.clickAddContact();

        expect(contactsPage.contactModal.isDisplayed()).toBeTruthy();
        contactsPage.closeContactModal();
        expect(contactsPage.contactModal.isDisplayed()).toBeFalsy();
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

        //TODO Check that previous deliveries are shown accurately
        directDeliveryPage.saveAndTrackDelivery();

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER2);
        expect(directDeliveryPage.firstPurchaseOrderAttributes).toContain('text-warning');
    });

    it('should acknowledge direct delivery for PO and generate alerts', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        ipShipmentsPage.visit();

        ipShipmentsPage.searchForShipment(PURCHASE_ORDER_NUMBER1);
        ipShipmentsPage.viewDeliveryDetails();
        ipShipmentsPage.specifyDeliveryAsReceived();
        ipShipmentsPage.specifyDeliveryReceiptDate('12/08/2015');
        ipShipmentsPage.specifyDeliveryConditionAsNotGood();
        ipShipmentsPage.specifyDeliverySatisfactionAsYes();
        ipShipmentsPage.addRemarks('The delivery was awesome');
        ipShipmentsPage.saveAndProceedToItemsInDelivery();

        var itemRowIndex = 0;
        ipShipmentsPage.specifyItemReceived(itemRowIndex, 'Yes');
        ipShipmentsPage.specifyQtyReceived(itemRowIndex, 500);
        ipShipmentsPage.specifyItemCondition(itemRowIndex, 'Damaged');
        ipShipmentsPage.specifyItemSatisfaction(itemRowIndex, 'No');
        ipShipmentsPage.addItemRemark(itemRowIndex, 'All Good');

        ipShipmentsPage.saveItemConfirmation();

        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        alertsPage.visit();
        expect(alertsPage.alertStatuses).toContain('IN BAD CONDITION');
        expect(alertsPage.alertOrderNumbers).toContain(PURCHASE_ORDER_NUMBER1);
        expect(alertsPage.alertItems).not.toContain('How Business Affects Us');
        expect(alertsPage.alertOrderDate).toContain('10-10-2021');
        expect(alertsPage.alertOrderValue).toContain('$80.31');
        expect(alertsPage.alertReporter).toContain('John Doe');
        expect(alertsPage.alertIP).toContain('WAKISO DHO');
        expect(alertsPage.alertLocation).toContain('Wakiso');

        alertsPage.goToItemAlerts();
        expect(alertsPage.alertStatuses).toContain('DAMAGED');
        expect(alertsPage.alertOrderNumbers).toContain(PURCHASE_ORDER_NUMBER1);
        expect(alertsPage.alertItems).toContain('How Business Affects Us');
        expect(alertsPage.alertOrderDate).toContain('10-10-2021');
        expect(alertsPage.alertOrderValue).toContain('$80.31');
        expect(alertsPage.alertReporter).toContain('John Doe');
        expect(alertsPage.alertIP).toContain('WAKISO DHO');
        expect(alertsPage.alertLocation).toContain('Wakiso');
    })

});
