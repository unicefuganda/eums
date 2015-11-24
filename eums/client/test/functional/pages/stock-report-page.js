var functionalTestUtils = require('./../functional-test-utils.js');

var StockReportPage = function () {};

StockReportPage.prototype = Object.create({}, {
    url: { get: function () { return '/#/stock-report' }},
    visit: {
        value: function () { browser.get(this.url);
    }},

    selectConsignee: { value: function (input) {
        element(by.id('s2id_select-ip')).click();
        element(by.css('.select2-input.select2-focused')).clear().sendKeys(input);
        element(by.css('.select2-results li')).click();
    }},

    selectOutcome: {
        value: function (searchText) {
            functionalTestUtils.fillSelect2Chosen('filter-programme-container', searchText);
        }
    },

    ipFilterSelection: { get: function () { return element(by.id('s2id_select-ip')).getText(); }},
    noDataMessage: { get: function () { return element(by.css('.empty-data-response')); }},

    clickUnicefShipmentsLink: { value: function () { element(by.css('.empty-data-response .unicef-shipments-link')).click(); }},

    totalReceived: { get: function () { return element(by.id('total_received')).getText(); }},
    totalDispensed: { get: function () { return element(by.id('total_dispensed')).getText(); }},
    totalBalance: { get: function () { return element(by.id('total_balance')).getText(); }},

    stockDocumentNumbers: { get: function () { return element.all(by.repeater('reportItem in reportData').column('reportItem.document_number')).getText(); }},
    stockReceivedValues: { get: function () { return element.all(by.repeater('reportItem in reportData').column('reportItem.total_value_received')).getText(); }},
    stockBalances: { get: function () { return element.all(by.repeater('reportItem in reportData').column('reportItem.balance')).getText(); }},

    selectFirstPO: { value: function () { element.all(by.repeater('reportItem in reportData').column('reportItem.document_number')).get(0).click(); }},
    selectSecondPO: { value: function () { element.all(by.repeater('reportItem in reportData').column('reportItem.document_number')).get(1).click(); }},

    itemCodes: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.code')).getText(); }},
    itemDescriptions: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.description')).getText(); }},
    itemDeliveredQty: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.quantity_delivered')).getText(); }},
    itemConfirmedQty: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.quantity_confirmed')).getText(); }},
    itemDeliveryDate: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.date_delivered')).getText(); }},
    itemBalances: { get: function () { return element.all(by.repeater('item in reportItem.items').column('item.balance')).getText(); }},
    sortBy: {
        value: function(className, order) {
            var toBeSorted = element(by.css('.padded-multi-line-5.centered.' + className));
            toBeSorted.click();
            if (order === 'asc') {
                toBeSorted.click();
            }
        }
    }
});

module.exports = new StockReportPage;
