var ReportsPage = function () {};

ReportsPage.prototype = Object.create({}, {
    url: { get: function () { return '/#/stock-report' }},
    visit: {
        value: function () { browser.get(this.url);
    }},

    selectConsignee: { value: function (input) {
        element(by.id('s2id_select-ip')).click();
        element(by.css('.select2-input.select2-focused')).clear().sendKeys(input);
        element(by.css('.select2-results li')).click();
    }},

    stockDocumentNumbers: { get: function () { return element.all(by.repeater('reportItem in reportData').column('reportItem.document_number')).getText(); }},
    stockReceivedValues: { get: function () { return element.all(by.repeater('reportItem in reportData').column('reportItem.total_value_received')).getText(); }},
    stockBalances: { get: function () { return element.all(by.repeater('reportItem in reportData').column('reportItem.balance')).getText(); }},

    selectFirstPO: { value: function () { element.all(by.repeater('reportItem in reportData').column('reportItem.document_number')).get(0).click(); }},

    itemCodes: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.code')).getText(); }},
    itemDescriptions: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.description')).getText(); }},
    itemDeliveredQty: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.quantity_delivered')).getText(); }},
    itemConfirmedQty: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.quantity_confirmed')).getText(); }},
    itemDeliveryDate: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.date_delivered')).getText(); }},
    itemBalances: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.balance')).getText(); }}
});

module.exports = new ReportsPage;
