var functionalTestUtils = require('./../functional-test-utils.js');

var DirectDeliveryPage = function () {
};

DirectDeliveryPage.prototype = Object.create({}, {
    url: {
        get: function () {
            return '/#/direct-delivery';
        }
    },
    visit: {
        value: function () {
            browser.get(this.url);
            waitForPageToLoad();
        }
    },
    waitForModalToLoad: {
        value: function () {
            var EC = protractor.ExpectedConditions;
            var modalControl = element(by.css('.modal.fade'));
            var modal = EC.visibilityOf(modalControl);
            browser.wait(modal, 5000, "Timeout when modal doesn't load");
        }
    },
    waitForModalToExit: {
        value: function () {
            var EC = protractor.ExpectedConditions;
            var modalControl = element(by.css('.modal.fade'));
            var modal = EC.invisibilityOf(modalControl);
            browser.wait(modal, 10000, "Timeout when modal doesn't exit");
        }
    },
    purchaseOrders: {
        get: function () {
            return element.all(by.repeater('purchaseOrder in purchaseOrders').column('purchaseOrder.orderNumber')).getText();
        }
    },
    purchaseOrderCount: {
        get: function () {
            return element.all(by.repeater('purchaseOrder in purchaseOrders')).count();
        }
    },
    selectPurchaseOrderByNumber: {
        value: function (text) {
            element(by.linkText(text)).click();
            waitForPageToLoad();
        }
    },
    selectSingleIP: {
        value: function () {
            element(by.id('btn-single-ip')).click();
            waitForPageToLoad();
        }
    },
    selectMultipleIP: {
        value: function () {
            element(by.id('btn-multiple-ip')).click();
            waitForPageToLoad();
        }
    },
    implementingPartner: {
        get: function () {
            return element(by.css('#input-consignee')).getText();
        }
    },
    programmeName: {
        get: function () {
            return element(by.className('secondary-header')).getText();
        }
    },
    purchaseOrderType: {
        get: function () {
            return element(by.id('po-type')).getText();
        }
    },
    purchaseOrderTotalValue: {
        get: function () {
            return element(by.id('po-total-value')).getText();
        }
    },
    firstRowQuantityShipped: {
        get: function () {
            return element.all(by.css('.table-row-input-column .form-control')).get(0);
        }
    },
    purchaseOrderItemCount: {
        get: function () {
            return element.all(by.repeater('(index, item) in purchaseOrderItems')).count();
        }
    },
    purchaseOrderItemMaterialNumbers: {
        get: function () {
            return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.item.materialCode')).getText();
        }
    },
    purchaseOrderItemDescriptions: {
        get: function () {
            return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.item.description')).getText();
        }
    },
    purchaseOrderItemQuantities: {
        get: function () {
            return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.quantity')).getText();
        }
    },
    purchaseOrderItemValues: {
        get: function () {
            return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.value')).getText();
        }
    },
    purchaseOrderItemBalances: {
        get: function () {
            return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.availableBalance')).getText();
        }
    },
    purchaseOrderItemDeliveryValues: {
        get: function () {
            return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.deliveryValue')).getText();
        }
    },
    purchaseOrderQuantities: {
        get: function () {
            return element.all(by.id('quantity-shipped')).getAttribute('value');
        }
    },
    purchaseOrderValues: {
        get: function () {
            return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.value')).getText();
        }
    },
    searchBar: {
        get: function () {
            return element(by.model('searchTerm.purchaseOrder'));
        }
    },
    searchForThisPurchaseOrder: {
        value: function (searchTerm) {
            this.searchBar.clear().sendKeys(searchTerm);
        }
    },
    firstPurchaseOrderAttributes: {
        get: function () {
            return element.all(by.repeater('purchaseOrder in purchaseOrder')).first().element(by.css('span')).getAttribute('class');
        }
    },
    selectItem: {
        value: function (item) {
            element(by.css('#select-sales-order')).click();
            element(by.css("#select-sales-order option[label='" + item + "']")).click();
            waitForPageToLoad();
        }
    },
    addConsignee: {
        value: function () {
            element(by.id('addConsigneeBtn')).click();
        }
    },
    setQuantity: {
        value: function (quantity) {
            element.all(by.id('input-quantity')).get(0).clear().sendKeys(quantity);
        }
    },
    setDeliveryDate: {
        value: function (date) {
            element.all(by.css('#input-delivery-date p input')).get(0).clear().sendKeys(date);
        }
    },
    setDeliveryDateForSingleIP: {
        value: function (date) {
            element.all(by.css('#input-delivery-date span input')).get(0).clear().sendKeys(date);
        }
    },
    setConsignee: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-consignee', input, true);
        }
    },
    setContact: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-contact', input, true);
        }
    },
    setContactForSingleIP: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-contact-single-ip', input, true);
        }
    },
    setDistrict: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-location', input, true);
        }
    },
    setTimeLimitationOnDistribution: {
        value: function (input) {
            fillInput('#input-time-limitation-on-distribution input', input);
        }
    },
    enableTracking: {
        value: function (input) {
            element.all(by.css('#input-track div input')).get(0).click();
        }
    },
    setDistrictForSingleIP: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-location-single-ip', input, true);
        }
    },
    saveDelivery: {
        value: function () {
            element(by.id('directDeliverySaveBtn')).click();
        }
    },
    saveDraftDelivery: {
        value: function () {
            element(by.id('save-draft')).click();
        }
    },
    saveAndTrackDelivery: {
        value: function () {
            element(by.id('save-and-track')).click();
        }
    },
    toastMessage: {
        get: function () {
            return element(by.repeater('message in messages')).getText();
        }
    },
    viewFirstPreviousDelivery: {
        value: function () {
            element.all(by.repeater('(index, delivery) in trackedDeliveries')).get(0).click();
            waitForPageToLoad();
        }
    },
    previousDeliveryDates: {
        get: function () {
            return element(by.repeater('(index, delivery) in trackedDeliveries').column('delivery.delivery_date')).getText();
        }
    },
    previousDeliveryTotalValues: {
        get: function () {
            return element(by.repeater('(index, delivery) in trackedDeliveries').column('delivery.total_value')).getText();
        }
    },
    deliveryModalMaterialNumbers: {
        get: function () {
            return element.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.item.materialCode')).getText();
        }
    },
    deliveryModalItemDescriptions: {
        get: function () {
            return element.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.item.description')).getText();
        }
    },
    deliveryModalDeliveriedQuantities: {
        get: function () {
            return element.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.targetedQuantity')).getText();
        }
    },
    deliveryModalItemValues: {
        get: function () {
            return element.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.deliveryValue(node.targetedQuantity)')).getText();
        }
    },
    timeLimitationOnDistribution: {
        get: function () {
            return element(by.css('#input-time-limitation-on-distribution input')).getAttribute('value');
        }
    },
});

module.exports = new DirectDeliveryPage;

function fillInput(css, input) {
    element.all(by.css(css)).get(0).clear().sendKeys(input);
}

function waitForPageToLoad() {
    var EC = protractor.ExpectedConditions;
    var spinner = element(by.css('#loading'));
    var screenHasLoaded = EC.invisibilityOf(spinner);
    browser.wait(screenHasLoaded, 5000, "Timeout exceeded while waiting for screen to load");
}
