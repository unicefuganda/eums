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
        get: function () {
            return element(by.css('ul.pagination li.active')).getText();
        }
    },

    districtHeader: {
        get: function () {
            return element(by.id('feedback-district-header'));
        }
    },
    consignees: {
        get: function () {
            return byRepeater('consignee.name');
        }
    },
    resultsCount: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report')).count()
        }
    },
    received: {
        get: function () {
            return byRepeater('deliveryReceived');
        }
    },
    shipmentDate: {
        get: function () {
            return byRepeater('shipmentDate');
        }
    },
    dateReceived: {
        get: function () {
            return byRepeater('dateOfReceipt');
        }
    },
    outcome: {
        get: function () {
            return byRepeater('programme.name');
        }
    },
    value: {
        get: function () {
            return byRepeater('value');
        }
    },
    sortBy: {
        value: function(sort, order) {
            var toBeSorted = element.all(by.css('.' + sort.replace(" ", "-"))).first();
            toBeSorted.click();
            if (order === 'asc') {
                toBeSorted.click();
            }
        }
    }
});

module.exports = new IpFeedbackReportByDeliveryPage;

function byRepeater(column) {
    return element.all(by.repeater('($index, itemReport) in report').column('itemReport.' + column)).first().getText();
}