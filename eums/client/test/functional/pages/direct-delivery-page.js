var DirectDeliveryPage = function () {};

DirectDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '#/direct-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
    }},

    purchaseOrders: { get: function () { return element.all(by.repeater('purchaseOrder in purchaseOrders').column('purchaseOrder.orderNumber')).getText(); }},
    purchaseOrderCount: { get: function () { return element.all(by.repeater('purchaseOrder in purchaseOrders')).count(); }},

    searchBar: { get:  function () { return element(by.id('filter')); }},

    searchForThisPurchaseOrder: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }}
});

module.exports = new DirectDeliveryPage;
