var functionalTestUtils = require('./../functional-test-utils.js');

var IpFeedbackReportByDeliveryPage = function () {
};

IpFeedbackReportByDeliveryPage.prototype = Object.create({}, {
    url: {
        get: function () {
            return '/#/ip-feedback-report-by-delivery'
        }
    },

    visit: {
        value: function () {
            browser.get(this.url);
        }
    },

    paginateTo: {
        value: function (pageNumber) {
            element(by.cssContainingText('ul.pagination li a', pageNumber)).click();
        }
    },

    pageNumber: {
        get: function() {
            return element(by.css('ul.pagination li.active')).getText();
        }
    },

    districtHeader: { get: function () {
        return element(by.id('feedback-district-header'));
    }},
    consignees: { get: function () { return element.all(by.repeater('($index, itemReport) in report').column('itemReport.consignee.name')).getText(); }},
    resultsCount: {get: function () { return element.all(by.repeater('($index, itemReport) in report')).count()}}
});

module.exports = new IpFeedbackReportByDeliveryPage;