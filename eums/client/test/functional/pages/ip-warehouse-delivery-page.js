var IpWarehouseDeliveryPage = function () {};

IpWarehouseDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '#/ip-warehouse-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
    }},

    waybillCount: { get: function () { return element.all(by.repeater('releaseOrder in releaseOrders')).count(); }},

    searchBar: { get:  function () { return element(by.id('filter')); }},

    searchForThisWaybill: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }}

});

module.exports = new IpWarehouseDeliveryPage;
