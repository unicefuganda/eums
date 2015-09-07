'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');
var contactsPage = require('./pages/contacts-page.js');
var ipWarehouseDeliveryPage = require('./pages/ip-warehouse-delivery-page.js');
var confirmItemByItem = require('./pages/ip-items-deliveries-page.js');
var PURCHASE_ORDER_NUMBER1, PURCHASE_ORDER_NUMBER2;
describe('Direct Delivery', function () {

    beforeEach(function () {
        loginPage.visit();
        PURCHASE_ORDER_NUMBER1 = '81026395';
        PURCHASE_ORDER_NUMBER2 = '81029906';
    });

    it('Admin should be able to create direct deliveries to multiple IPs', function () {

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

    it('Acknowledge direct delivery for purchase order', function () {
        loginPage.loginAs('wakiso', 'wakiso');
        ipWarehouseDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder(PURCHASE_ORDER_NUMBER2);
        ipWarehouseDeliveryPage.confirmDelivery();
        ipWarehouseDeliveryPage.selectAnswer();
        ipWarehouseDeliveryPage.deliveryDate();
        ipWarehouseDeliveryPage.itemCondition();
        ipWarehouseDeliveryPage.satisfiedByItem();
        ipWarehouseDeliveryPage.extraComment();
        ipWarehouseDeliveryPage.confirmItems();

        confirmItemByItem.itemConditionFirst();
        confirmItemByItem.itemSatisfiedFirst();
        confirmItemByItem.remarksFirst();
        confirmItemByItem.waitForElementToLoad('add-remark-answer-modal-0');
        confirmItemByItem.enterRemarksFirst('Goods in perfect condition');
        confirmItemByItem.saveCommentsFirst();
        confirmItemByItem.exitRemarksModal();
        confirmItemByItem.waitForThisElementToExit('add-remark-answer-modal-0');

        confirmItemByItem.itemConditionSecond();
        confirmItemByItem.itemSatisfiedSecond();
        confirmItemByItem.remarksSecond();
        confirmItemByItem.waitForElementToLoad('add-remark-answer-modal-1');
        confirmItemByItem.enterRemarksSecond('Goods in perfect condition. I am happy');
        confirmItemByItem.saveCommentsSecond();
        confirmItemByItem.waitForThisElementToExit('add-remark-answer-modal-1');

        confirmItemByItem.itemConditionThird();
        confirmItemByItem.itemSatisfiedThird();
        confirmItemByItem.remarksThird();
        confirmItemByItem.waitForElementToLoad('add-remark-answer-modal-2');
        confirmItemByItem.enterRemarksThird('Goods in perfect condition. I am Impressed');
        confirmItemByItem.saveCommentsThird();
        confirmItemByItem.waitForThisElementToExit('add-remark-answer-modal-2');

         confirmItemByItem.itemConditionFourth();
        confirmItemByItem.itemSatisfiedFourth();
        confirmItemByItem.remarksFourth();
        confirmItemByItem.waitForElementToLoad('add-remark-answer-modal-3');
        confirmItemByItem.enterRemarksFourth('Goods in perfect condition. I am out of here');
        confirmItemByItem.saveCommentsFourth();
        confirmItemByItem.waitForThisElementToExit('add-remark-answer-modal-3');
        confirmItemByItem.saveRecords();
    

    })

});
