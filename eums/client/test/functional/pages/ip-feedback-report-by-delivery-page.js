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
    satisfied: {
        get: function () {
            return element.all(by.css('.glyphicon.glyphicon-size-17.glyphicon-top-5')).getAttribute('class');
        }
    },
    goodCondition: {
        get: function () {
            return element.all(by.css('.eums-border-status.eums-border-center.eums-border-width-50')).getText();
        }
    },
    sortBy: {
        value: function (className, order) {
            var toBeSorted = element(by.css('.pad-left-5.' + className));
            toBeSorted.click();
            if (order === 'asc') {
                toBeSorted.click();
            }
        }
    },
    searchByReceived: {
        value: function (searchTerm) {
            functionalTestUtils.wait(1000);
            functionalTestUtils.fillSelect2Chosen('filter-received-container', searchTerm);
        }
    },
    searchBySatisfied: {
        value: function (searchTerm) {
            functionalTestUtils.wait(1000);
            functionalTestUtils.fillSelect2Chosen('filter-satisfied-container', searchTerm);
        }
    },
    searchByGoodCondition: {
        value: function (searchTerm) {
            functionalTestUtils.wait(1000);
            functionalTestUtils.fillSelect2Chosen('filter-condition-container', searchTerm);
        }
    }
});

module.exports = new IpFeedbackReportByDeliveryPage;

function byRepeater(column) {
    return element.all(by.repeater('($index, itemReport) in report').column('itemReport.' + column)).getText();
}
