var DirectDeliveryPage = function () {};

DirectDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '#/direct-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
        var EC = protractor.ExpectedConditions;
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var ordersHaveLoaded = EC.stalenessOf(fadingModal);
        browser.wait(ordersHaveLoaded, 5000, "Timeout exceeded while loading purchase orders");
    }},

    purchaseOrders: { get: function () { return element.all(by.repeater('purchaseOrder in purchaseOrders').column('purchaseOrder.orderNumber')).getText(); }},
    purchaseOrderCount: { get: function () { return element.all(by.repeater('purchaseOrder in purchaseOrders')).count(); }},

    selectPurchaseOrderByNumber: { value: function (text) { element(by.linkText(text)).click(); }},
    selectSingleIP: { value: function () { element(by.id('single-ip')).click(); }},
    selectMultipleIP: { value: function () { element(by.id('multiple-ip')).click(); }},

    implementingPartner: { get: function () { return element(by.css('#input-consignee')).getText(); }},

    programmeName: { get: function () { return element(by.className('secondary-header')).getText(); }},
    purchaseOrderType: { get: function () { return element(by.id('po-type')).getText(); }},
    purchaseOrderTotalValue: { get: function () { return element(by.id('po-total-value')).getText(); }},

    firstRowQuantityShipped: {get: function () { return element.all(by.css('.table-row-input-column .form-control')).get(0); }},

    purchaseOrderItemCount: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems')).count(); }},
    purchaseOrderItemMaterialNumbers: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.item.materialCode')).getText(); }},
    purchaseOrderItemDescriptions: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.item.description')).getText(); }},
    purchaseOrderItemQuantities: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.quantity')).getText(); }},
    purchaseOrderItemValues: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.value')).getText(); }},
    purchaseOrderItemBalances: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.availableBalance')).getText(); }},
    purchaseOrderItemDeliveryValues: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.deliveryValue')).getText(); }},
    purchaseOrderQuantities: { get: function () { return element.all(by.id('quantity-shipped')).getAttribute('value'); }},
    purchaseOrderValues: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.value')).getText(); }},

    searchBar: { get:  function () { return element(by.id('filter')); }},
    searchForThisPurchaseOrder: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }},

    firstPurchaseOrderAttributes: { get: function () {
        return element.all(by.repeater('purchaseOrder in purchaseOrder')).first().element(by.css('span')).getAttribute('class');
    }},

    selectItem: { value: function (item) {
        element(by.css('#select-sales-order')).click();
        element(by.css("#select-sales-order option[label='" + item + "']")).click();
        var EC = protractor.ExpectedConditions;
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var itemsHaveLoaded = EC.stalenessOf(fadingModal);
        browser.wait(itemsHaveLoaded, 5000, "Timeout exceeded while loading item");
    }},

    addConsignee: { value: function () { element(by.id('addConsigneeBtn')).click(); }},

    setQuantity: { value: function (quantity) {
        element.all(by.id('input-quantity')).get(0).clear().sendKeys(quantity);
    }},

    setDeliveryDate: { value: function (date) {
        element.all(by.css('#input-delivery-date p input')).get(0).clear().sendKeys(date);
    }},

    setDeliveryDateForSingleIP: { value: function (date) {
        element.all(by.css('#input-delivery-date span input')).get(0).clear().sendKeys(date);
    }},

    setConsignee: { value: function (input) {
        fillSelect2Chosen('input-consignee', input)
    }},

    setContact: { value: function (input) {
        fillSelect2Chosen('input-contact', input)
    }},

    setContactForSingleIP: { value: function (input) {
        fillSelect2Chosen('input-contact-single-ip', input)
    }},

    setDistrict: { value: function (input) {
        fillSelect2Chosen('input-location', input)
    }},

    setDistrictForSingleIP: { value: function (input) {
        fillSelect2Chosen('input-location-single-ip', input)
    }},

    saveDelivery: { value: function () {
        element(by.id('directDeliverySaveBtn')).click();
    }},

    saveDraftDelivery: { value: function () {
        element(by.id('save-draft')).click();
    }},

    saveAndTrackDelivery: { value: function () {
        element(by.id('save-and-track')).click();
    }},

    confirmDelivery: { value: function () {
        var EC = protractor.ExpectedConditions;

        var confirmButton = element.all(by.id('deliveryConfirmYes')).get(0);
        var confirmationIsVisible = EC.visibilityOf(confirmButton);
        browser.wait(confirmationIsVisible, 5000, "Timeout exceeded while waiting for visibility of confirmation modal");

        confirmButton.click();

        var successToast = element(by.repeater('message in messages'));
        var deliveryIsSaved = EC.stalenessOf(successToast);
        browser.wait(deliveryIsSaved, 5000, "Timeout exceeded while while waiting for delivery saved notifcation");
    }},

    toastMessage: { get: function () { return element(by.repeater('message in messages')).getText(); }},

    viewFirstPreviousDelivery: { value: function () {
        element.all(by.repeater('(index, delivery) in trackedDeliveries')).get(0).click();

        var EC = protractor.ExpectedConditions;
        var loadingModal = element(by.id('loading'));
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var deliveriesModalHasLoaded = EC.and(EC.invisibilityOf(loadingModal), EC.stalenessOf(fadingModal));

        browser.wait(deliveriesModalHasLoaded, 5000, "Timeout exceeded while loading previous deliveries modal");
    }},

    previousDeliveryDates: { get: function () { return element(by.repeater('(index, delivery) in trackedDeliveries').column('delivery.delivery_date')).getText(); }},
    previousDeliveryTotalValues: { get: function () { return element(by.repeater('(index, delivery) in trackedDeliveries').column('delivery.total_value')).getText(); }},

    deliveryModalMaterialNumbers: { get: function () { return element.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.item.materialCode')).getText(); }},
    deliveryModalItemDescriptions: { get: function () { return element.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.item.description')).getText(); }},
    deliveryModalDeliveriedQuantities: { get: function () { return element.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.targetedQuantity')).getText(); }},
    deliveryModalItemValues: { get: function () { return element.all(by.repeater('(index, node) in deliveryInView.distributionplannodeSet').column('node.item.deliveryValue(node.targetedQuantity)')).getText(); }}

});

module.exports = new DirectDeliveryPage;

function fillSelect2Chosen (id, input) {
    element(by.id(id)).click();
    element(by.css('.select2-input.select2-focused')).clear().sendKeys(input);
    element(by.css('.select2-results li')).click();
}
