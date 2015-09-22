var FeedbackReportPage = function () {};

FeedbackReportPage.prototype = Object.create({}, {
    url: { get: function(){ return '/#/end-user-responses' }},

    visit: { value: function(){
        browser.get(this.url);
    }},

    programmeSelect: { get: function() { return element.all(by.css('.chosen-single.chosen-default span')).get(0); }},
    programmeResults: { get: function(){ return element.all(by.css('.chosen-drop')).get(0).getText(); }},

    consigneeSelect: { get: function() { return element.all(by.css('.chosen-single.chosen-default span')).get(1); }},
    consigneeSearchInput: { get: function() { return element.all(by.css('.select2-input')).get(0); }},
    consigneeResults: { get: function(){ return element.all(by.css('.chosen-drop')).get(1).getText(); }}
});

module.exports = new FeedbackReportPage;