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

    purchaseOrderItems: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.item.description')).getText(); }},
    purchaseOrderQuantities: { get: function () { return element.all(by.repeater('(index, item) in purchaseOrderItems').column('item.quantity')).getText(); }},
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
    }},

    addConsignee: { value: function () { element(by.id('addConsigneeBtn')).click(); }},

    setQuantity: { value: function (quantity) {
        element.all(by.id('input-quantity')).get(0).clear().sendKeys(quantity);
    }},

    setDeliveryDate: { value: function (date) {
        element.all(by.css('#input-delivery-date p input')).get(0).clear().sendKeys(date);
    }},

    setConsignee: { value: function (consignee) {
        element(by.id('select2-chosen-14')).click();
        element(by.id('s2id_autogen14_search')).clear().sendKeys(consignee);
        element(by.css('.select2-results li')).click();
    }},

    setContact: { value: function (contact) {
        element(by.id('select2-chosen-18')).click();
        element(by.id('s2id_autogen18_search')).clear().sendKeys(contact);
        element(by.css('.select2-results li')).click();
    }},

    setDistrict: { value: function (district) {
        element(by.id('s2id_autogen19')).click();
        element(by.id('s2id_autogen20_search')).clear().sendKeys(district)
        element(by.css('.select2-results li')).click();
    }},

    saveDelivery: { value: function () {
        element(by.id('directDeliverySaveBtn')).click();
    }},

    confirmDelivery: { value: function () {
        var EC = protractor.ExpectedConditions;

        var confirmButton = element(by.id('deliveryConfirmYes'));
        var confirmationIsVisible = EC.visibilityOf(confirmButton);
        browser.wait(confirmationIsVisible, 5000, "Timeout exceeded while waiting for visibility of confirmation modal");

        confirmButton.click();

        var successToast = element(by.repeater('message in messages'));
        var deliveryIsSaved = EC.stalenessOf(successToast);
        browser.wait(deliveryIsSaved, 5000, "Timeout exceeded while while waiting for delivery saved notifcation");
    }}

});

module.exports = new DirectDeliveryPage;
