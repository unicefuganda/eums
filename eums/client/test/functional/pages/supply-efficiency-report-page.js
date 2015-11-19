var StockReportPage = function () {};

StockReportPage.prototype = Object.create({}, {
    url: { get: function () { return '/#/supply-efficiency-report?by=delivery' }},
    visit: {
        value: function () { browser.get(this.url);
    }},

    goToItemView: {value: function(){element(by.id('supply-efficiency-report-by-item')).click();}},
    goToOutcomeView: {value: function(){element(by.id('supply-efficiency-report-by-outcome')).click();}},
    goToPoWayBillView: {value: function(){element(by.id('supply-efficiency-report-by-po-or-waybill')).click();}},
    goToIPView: {value: function(){element(by.id('supply-efficiency-report-by-ip')).click();}},
    goToDistrictView: {value: function(){element(by.id('supply-efficiency-report-by-district')).click();}},

    filterByEndDate:{value: function(date){element(by.css('#supply-efficiency-report-end-date-input input.form-control')).clear().sendKeys(date);}},
    filterByStartDate:{value: function(date){element(by.css('#supply-efficiency-report-start-date-input input.form-control')).clear().sendKeys(date);}},
    filterBy: {value: function (id, input) {fillSelect2Chosen('supply-efficiency-report-' + id + '-input', input);}},
    input: {value: function (id, input) {element(by.css('#supply-efficiency-report-' + id + '-input input')).clear().sendKeys(input);}},

    contextualHeaderColumns: {get: function(){return element.all(by.css('.contextual-column'));}},
    standardHeaderColumns: {get: function(){return element.all(by.css('.standard-column'));}},
    subHeaderContextualColumns: {get: function(){return element.all(by.css('.table-sub-header .contextual'));}},
    subHeaderStandardColumns: {get: function(){return element.all(by.css('.table-sub-header .standard'));}},
    reportsCount: {get: function () {return element.all(by.repeater('bucket in report')).count();} },

    deliveryDates: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.delivery.delivery_date')).getText(); }},
    ipNames: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.ip.name')).getText(); }},
    districts: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.delivery.location')).getText(); }},
    itemDescriptions: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.order_item.item.description')).getText(); }},
    materialCodes: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.order_item.item.material_code')).getText(); }},
    programmeNames: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.programme.name')).getText(); }},
    orderNumbers: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.order_item.order.order_number')).getText(); }},
    orderTypes: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.order_item.order.order_type')).getText(); }},
    locations: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.identifier.location')).getText(); }},
    unicefValues: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.unicef.total_value')).getText(); }},
    ipReceivedValues: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.ip_receipt.total_value_received')).getText(); }},
    ipConfirmed: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.ip_receipt.confirmed')).getText(); }},
    ipReceivedDelays: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.ip_receipt.average_delay')).getText(); }},
    ipDistributedValues: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.ip_distribution.total_value_distributed')).getText(); }},
    ipDistributedBalance: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.ip_distribution.balance ')).getText(); }},
    endUserValueReceived: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.end_user.total_value_received')).getText(); }},
    endUserConfirmed: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.end_user.confirmed')).getText(); }},
    endUserDelayed: { get: function () { return element.all(by.repeater('bucket in report').column('bucket.delivery_stages.end_user.average_delay')).getText(); }}
});

function fillSelect2Chosen(id, input) {
    element(by.css('#' + id + ' .select2-chosen' )).click();
    element(by.css('.select2-input.select2-focused')).clear().sendKeys(input);
    element(by.css('.select2-results li')).click();
}


module.exports = new StockReportPage;
