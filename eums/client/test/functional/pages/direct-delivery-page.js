var functionalTestUtils = require('./../functional-test-utils.js');

var DirectDeliveryPage = function () {};

DirectDeliveryPage.prototype = Object.create({bro: browser, ele: element}, {
    url: {
        get: function () {
            return '/#/direct-delivery';
        }
    },
    visit: {
        value: function () {
            this.bro.get(this.url);
            waitForPageToLoad(this.bro, this.ele);
        }
    },
    switchBrowser: {
        value: function (bro) {
            this.bro = bro || browser;
            this.ele = this.bro.element;
        }
    },
    waitForModalToLoad: {
        value: function () {
            var EC = protractor.ExpectedConditions;
            var modalControl = this.ele(by.css('.modal.fade'));
            var modal = EC.visibilityOf(modalControl);
            this.bro.wait(modal, 5000, "Timeout when modal doesn't load");
        }
    },
    waitForModalToExit: {
        value: function () {
            var EC = protractor.ExpectedConditions;
            var modalControl = this.ele(by.css('.modal.fade'));
            var modal = EC.invisibilityOf(modalControl);
            this.bro.wait(modal, 10000, "Timeout when modal doesn't exit");
        }
    },
    purchaseOrders: {
        get: function () {
            return this.ele.all(by.repeater('purchaseOrder in purchaseOrders').column('purchaseOrder.orderNumber')).getText();
        }
    },
    purchaseOrderCount: {
        get: function () {
            return this.ele.all(by.repeater('purchaseOrder in purchaseOrders')).count();
        }
    },
    selectPurchaseOrderByNumber: {
        value: function (text) {
            this.ele(by.linkText(text)).click();
            waitForPageToLoad(this.bro, this.ele);
        }
    },
    selectSingleIP: {
        value: function () {
            this.ele(by.id('btn-single-ip')).click();
            waitForPageToLoad(this.bro, this.ele);
        }
    },
    selectMultipleIP: {
        value: function () {
            this.ele(by.id('btn-multiple-ip')).click();
            waitForPageToLoad(this.bro, this.ele);
        }
    },
    implementingPartner: {
        get: function () {
            return this.ele(by.css('#input-consignee')).getText();
        }
    },
    programmeName: {
        get: function () {
            return this.ele(by.className('secondary-header')).getText();
        }
    },
    purchaseOrderType: {
        get: function () {
            return this.ele(by.id('po-type')).getText();
        }
    },
    purchaseOrderTotalValue: {
        get: function () {
            return this.ele(by.id('po-total-value')).getText();
        }
    },
    firstRowQuantityShipped: {
        get: function () {
            return this.ele.all(by.css('.table-row-input-column .form-control')).get(0);
        }
    },
    purchaseOrderItemCount: {
        get: function () {
            return this.ele.all(by.repeater('(index, item) in purchaseOrderItems')).count();
        }
    },
    purchaseOrderItemMaterialNumbers: {
        get: function () {
            return this.ele.all(by.repeater('(index, item) in purchaseOrderItems').column('item.item.materialCode')).getText();
        }
    },
    purchaseOrderItemDescriptions: {
        get: function () {
            return this.ele.all(by.repeater('(index, item) in purchaseOrderItems').column('item.item.description')).getText();
        }
    },
    purchaseOrderItemQuantities: {
        get: function () {
            return this.ele.all(by.repeater('(index, item) in purchaseOrderItems').column('item.quantity')).getText();
        }
    },
    purchaseOrderItemValues: {
        get: function () {
            return this.ele.all(by.repeater('(index, item) in purchaseOrderItems').column('item.value')).getText();
        }
    },
    purchaseOrderItemBalances: {
        get: function () {
            return this.ele.all(by.repeater('(index, item) in purchaseOrderItems').column('item.availableBalance')).getText();
        }
    },
    purchaseOrderItemDeliveryValues: {
        get: function () {
            return this.ele.all(by.repeater('(index, item) in purchaseOrderItems').column('item.deliveryValue')).getText();
        }
    },
    purchaseOrderQuantities: {
        get: function () {
            return this.ele.all(by.id('quantity-shipped')).getAttribute('value');
        }
    },
    purchaseOrderValues: {
        get: function () {
            return this.ele.all(by.repeater('(index, item) in purchaseOrderItems').column('item.value')).getText();
        }
    },
    searchBar: {
        get: function () {
            return this.ele(by.model('searchTerm.purchaseOrder'));
        }
    },
    searchForThisPurchaseOrder: {
        value: function (searchTerm) {
            this.searchBar.clear().sendKeys(searchTerm);
            waitForPageToLoad(this.bro, this.ele);
        }
    },
    firstPurchaseOrderAttributes: {
        get: function () {
            return this.ele.all(by.repeater('purchaseOrder in purchaseOrders')).first().element(by.css('span')).getAttribute('class');
        }
    },
    selectItem: {
        value: function (item) {
            this.ele(by.css('#select-sales-order')).click();
            this.ele(by.css('#select-sales-order option[label="' + item + '"]')).click();
            waitForPageToLoad(this.bro, this.ele);
        }
    },
    addConsignee: {
        value: function () {
            this.ele(by.id('addConsigneeBtn')).click();
        }
    },
    setQuantity: {
        value: function (quantity) {
            this.ele.all(by.id('input-quantity')).get(0).clear().sendKeys(quantity);
        }
    },
    setDeliveryDate: {
        value: function (date) {
            this.ele.all(by.css('#input-delivery-date p input')).get(0).clear().sendKeys(date);
        }
    },
    setDeliveryDateForSingleIP: {
        value: function (date) {
            this.ele.all(by.css('#input-delivery-date span input')).get(0).clear().sendKeys(date);
        }
    },
    setConsignee: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-consignee', input, this.ele);
        }
    },
    setContact: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-contact', input, this.ele);
        }
    },
    setContactForSingleIP: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-contact-single-ip', input, this.ele);
        }
    },
    setDistrict: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-location', input, this.ele);
        }
    },
    setTimeLimitationOnDistribution: {
        value: function (input) {
            fillInput(this.ele, '#input-time-limitation-on-distribution input', input);
        }
    },
    enableTracking: {
        value: function (input) {
            this.ele.all(by.css('#input-track div input')).get(0).click();
        }
    },
    setDistrictForSingleIP: {
        value: function (input) {
            functionalTestUtils.fillSelect2ChosenNoTop('input-location-single-ip', input, this.ele);
        }
    },
    saveDelivery: {
        value: function () {
            this.ele(by.id('directDeliverySaveBtn')).click();
            this.bro.sleep(1500);
        }
    },
    saveDraftDelivery: {
        value: function () {
            this.ele(by.id('save-draft')).click();
            this.bro.sleep(1500);
        }
    },
    saveAndTrackDelivery: {
        value: function () {
            this.ele(by.id('save-and-track')).click();
            this.bro.sleep(1500);
        }
    },
    toastMessage: {
        get: function () {
            return this.ele(by.repeater('message in messages')).getText();
        }
    },
    viewFirstPreviousDelivery: {
        value: function () {
            this.ele.all(by.repeater('(index, delivery) in trackedDeliveries')).get(0).click();
            waitForPageToLoad(this.bro, this.ele);
        }
    },
    previousDeliveryDates: {
        get: function () {
            return this.ele(by.repeater('(index, delivery) in trackedDeliveries').column('delivery.delivery_date')).getText();
        }
    },
    previousDeliveryTotalValues: {
        get: function () {
            return this.ele(by.repeater('(index, delivery) in trackedDeliveries').column('delivery.total_value')).getText();
        }
    },
    deliveryModalMaterialNumbers: {
        get: function () {
            return this.ele.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.item.materialCode')).getText();
        }
    },
    deliveryModalItemDescriptions: {
        get: function () {
            return this.ele.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.item.description')).getText();
        }
    },
    deliveryModalDeliveriedQuantities: {
        get: function () {
            return this.ele.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.targetedQuantity')).getText();
        }
    },
    deliveryModalItemValues: {
        get: function () {
            return this.ele.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.deliveryValue(node.targetedQuantity)')).getText();
        }
    },
    timeLimitationOnDistribution: {
        get: function () {
            return this.ele(by.css('#input-time-limitation-on-distribution input')).getAttribute('value');
        }
    }
});

module.exports = new DirectDeliveryPage;

function fillInput(ele, css, input) {
    ele.all(by.css(css)).get(0).clear().sendKeys(input);
}

function waitForPageToLoad(bro, ele) {
    var EC = protractor.ExpectedConditions;
    var spinner = ele(by.css('#loading'));
    var screenHasLoaded = EC.invisibilityOf(spinner);
    bro.wait(screenHasLoaded, 5000, "Timeout exceeded while waiting for screen to load");
}
