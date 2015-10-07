var functionalTestUtils = require('./../functional-test-utils.js');

var IpFeedbackReportByItemPage = function () {
};

IpFeedbackReportByItemPage.prototype = Object.create({}, {
    url: {
        get: function () {
            return '/#/ip-feedback-report-by-item'
        }
    },

    visit: {
        value: function () {
            browser.get(this.url);
        }
    },
    filterByProgramme: {
        value: function (searchText) {
            functionalTestUtils.fillSelect2Chosen('filter-programme-container', searchText);
        }
    },
    clearProgramme: {
        value: function () {
            functionalTestUtils.clearSelect2Chosen('filter-programme-container');
        }
    },
    outComes: {
        get: function () {
            return element.all(by.css('.report-item'));
        }
    },
    filterByConsignee: {
        value: function (searchText) {
            functionalTestUtils.fillSelect2Chosen('filter-consignee-container', searchText);
        }
    },
    clearConsignee: {
        value: function () {
            functionalTestUtils.clearSelect2Chosen('filter-consignee-container');
        }
    },
    itemDescription: {
        get: function () {
            return element(by.id('filter-item'));
        }
    },
    poWaybill: {
        get: function () {
            return element(by.id('filter-po-waybill'));
        }
    },
    filterByItemDescription: {
        value: function (searchText) {
            this.itemDescription.sendKeys(searchText);
        }
    },
    filterByPoWaybill: {
        value: function (searchText) {
            this.poWaybill.sendKeys(searchText);
        }
    },
    clearItemDescription: {
        value: function () {
            this.itemDescription.clear();
        }
    },
    clearPoWaybill: {
        value: function () {
            this.poWaybill.clear();
        }
    }
});

module.exports = new IpFeedbackReportByItemPage;