var EndUserFeedbackReportPage = function () {};

EndUserFeedbackReportPage.prototype = Object.create({}, {
    url: { get: function(){ return '/#/end-user-feedback-report' }},

    visit: { value: function(){
        browser.get(this.url);
    }},
    search: { value: function (searchTerm) {
        element(by.model('searchTerm')).sendKeys(searchTerm);
    }},
    resultsCount: {get: function () { return element.all(by.repeater('($index, itemReport) in report')).count()}},
    itemDescriptions: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.item_description')).getText(); }},
    programmes: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.programme')).getText(); }},
    implementingPartners: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.implementing_partner')).getText(); }},
    consignees: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.consignee')).getText(); }},
    orderNumbers: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.order_number')).getText(); }},
    quantitiesShipped: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.quantity_shipped')).getText(); }},
    values: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.value')).getText(); }},
    productReceived: { get: function () { return element.all(by.css('.eums-border-status.eums-border-center.eums-border-width-50')).getText(); }},
    dateOfReceipt: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.answers.dateOfReceipt')).getText(); }},
    amountReceived: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.answers.amountReceived')).getText(); }},
    qualityOfProduct: { get: function () { return element.all(by.css('.eums-border-status.eums-border-center.eums-border-width-95')).getText(); }},
    satisfiedWithProduct: { get: function () { return element.all(by.css('.glyphicon.glyphicon-size-17.glyphicon-top-5')).getAttribute('class'); }}
});

module.exports = new EndUserFeedbackReportPage;