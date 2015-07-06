var WarehouseDeliveryPage = function () {};

WarehouseDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '#/warehouse-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
    }},

    releaseOrders: { get: function () { return element.all(by.repeater('releaseOrder in releaseOrders').column('releaseOrder.waybill')).getText(); }}
});

module.exports = new WarehouseDeliveryPage;
