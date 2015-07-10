var WarehouseDeliveryPage = function () {};

WarehouseDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '#/warehouse-delivery'; }},

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

    searchBar: { get:  function () { return element(by.id('filter')); }},

    searchForThisWaybill: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }}

});

module.exports = new WarehouseDeliveryPage;
