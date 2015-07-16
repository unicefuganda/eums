var IpDirectDeliveryPage = function () {};

IpDirectDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '#/ip-direct-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
    }},

    purchaseOrderCount: { get: function () { return element.all(by.repeater('purchaseOrder in purchaseOrders')).count(); }},

    searchBar: { get:  function () { return element(by.id('filter')); }},

    searchForThisPurchaseOrder: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }}

});

module.exports = new IpDirectDeliveryPage;
