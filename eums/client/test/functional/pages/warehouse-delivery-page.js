var WarehouseDeliveryPage = function () {};

WarehouseDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '#/warehouse-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
    }},

    waybills: { get: function () { return element.all(by.repeater('releaseOrder in releaseOrders').column('releaseOrder.waybill')).getText(); }},
    waybillCount: { get: function () { return element.all(by.repeater('releaseOrder in releaseOrders')).count(); }},

    searchBar: { get:  function () { return element(by.id('filter')); }},

    searchForThisWaybill: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }}

});

module.exports = new WarehouseDeliveryPage;