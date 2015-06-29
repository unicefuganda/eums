var FeedbackReportPage = function () {};

FeedbackReportPage.prototype = Object.create({}, {
    url: { get: function(){ return '#/end-user-responses' }},

    visit: { value: function(){
        browser.get(this.url);
    }},

    consigneeSelect: { get: function() { return element.all(by.css('.chosen-single.chosen-default span')).get(1); }},
    consigneeResults: { get: function(){ return element.all(by.css('.chosen-drop')).get(1).getText(); }}
});

module.exports = new FeedbackReportPage;