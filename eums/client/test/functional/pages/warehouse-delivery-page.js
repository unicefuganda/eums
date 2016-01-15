var WarehouseDeliveryPage = function () {};

WarehouseDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '/#/warehouse-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
        var EC = protractor.ExpectedConditions;
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var ordersHaveLoaded = EC.stalenessOf(fadingModal);
        browser.wait(ordersHaveLoaded, 5000, "Timeout exceeded while loading release orders");
    }},

    waybills: { get: function () { return element.all(by.repeater('releaseOrder in releaseOrders').column('releaseOrder.waybill')).getText(); }},
    waybillCount: { get: function () { return element.all(by.repeater('releaseOrder in releaseOrders')).count(); }},

    selectWaybillByNumber: { value: function (text) { element(by.linkText(text)).click(); }},
    waybillItems: { get: function () { return element.all(by.repeater('(itemIndex, releaseOrderItem) in releaseOrderItems').column('releaseOrderItem.item.description')).getText(); }},

    waybillQuantities: { get: function () { return element.all(by.repeater('(itemIndex, releaseOrderItem) in releaseOrderItems').column('releaseOrderItem.quantity')).getText(); }},
    waybillValues: { get: function () { return element.all(by.repeater('(itemIndex, releaseOrderItem) in releaseOrderItems').column('releaseOrderItem.value')).getText(); }},

    searchBar: { get:  function () { return element(by.model('searchTerm.waybill')); }},

    searchForThisWaybill: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }},

    selectContact: { value: function (contact) {
        element(by.id('select2-chosen-4')).click();
        element(by.id('s2id_autogen4_search')).clear().sendKeys(contact);
        element(by.css('.select2-results li')).click();
    }},

    selectLocation: { value: function (location) {
        element(by.id('select2-chosen-6')).click();
        element(by.id('s2id_autogen6_search')).clear().sendKeys(location);
        element(by.css('.select2-results li')).click();
    }},

    saveDelivery: { value: function () {
        element(by.id('warehouseSaveBtn')).click();

        var EC = protractor.ExpectedConditions;
        var successToast = element(by.repeater('message in messages'));
        var deliveryIsSaved = EC.stalenessOf(successToast);

        browser.wait(deliveryIsSaved, 5000, "Timeout exceeded while while waiting for delivery saved notifcation");
    }},

    firstReleaseOrderAttributes: { get: function () {
        return element.all(by.repeater('releaseOrder in releaseOrders')).first().element(by.css('span')).getAttribute('class');
    }},
    enableTracking: { value: function () {
       element(by.model('track')).click();
    }}
});

module.exports = new WarehouseDeliveryPage;
