var functionalTestUtils = require('./../functional-test-utils.js');

var ItemFeedbackReportPage = function () {
};

ItemFeedbackReportPage.prototype = Object.create({}, {
    url: {
        get: function () {
            return '/#/item-feedback-report'
        }
    },

    visit: {
        value: function () {
            browser.get(this.url);
        }
    },
    searchByItemDescription: {
        value: function (itemDescription) {
            element(by.model('searchTerm.itemDescription')).sendKeys(itemDescription);
        }
    },
    searchByProgramme: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-programme-container', searchTerm);
        }
    },
    searchByWaybill: {
        value: function (waybill) {
            element(by.model('searchTerm.poWaybill')).sendKeys(waybill);
        }
    },

    searchByRecipientType: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-recipient-type-container', searchTerm);
        }
    },

    searchByReceived: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-received-container', searchTerm);
        }
    },
    searchBySatisfied: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-satisfied-container', searchTerm);
        }
    },
    searchByQuality: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-quality-container', searchTerm);
        }
    },

    searchByDistrict: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-district-container', searchTerm);
        }
    },

    districtSelect2: {
        get: function () {
            return element(by.id('select-district'));
        }
    },
    resultsCount: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report')).count()
        }
    },
    itemDescriptions: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.item_description')).getText();
        }
    },
    programmes: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.programme')).getText();
        }
    },
    implementingPartners: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.implementing_partner')).getText();
        }
    },
    consignees: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.consignee')).getText();
        }
    },
    orderNumbers: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.order_number')).getText();
        }
    },
    quantitiesShipped: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.quantity_shipped')).getText();
        }
    },
    value: {
        get: function () {
            return byRepeater('value');
        }
    },
    values: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.value')).getText();
        }
    },
    productReceived: {
        get: function () {
            return element.all(by.css('.eums-border-status.eums-border-center.eums-border-width-50')).getText();
        }
    },
    dateOfReceipt: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.mergedDateOfReceipt')).getText();
        }
    },
    amountReceived: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.answers.amountReceived.value')).getText();
        }
    },
    qualityOfProduct: {
        get: function () {
            return element.all(by.css('.eums-border-status.eums-border-center.eums-border-width-95')).getText();
        }
    },
    satisfiedWithProduct: {
        get: function () {
            return element.all(by.css('.glyphicon.glyphicon-size-17.glyphicon-top-5')).getAttribute('class');
        }
    },
    distributionStage: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.tree_position')).getText();
        }
    },
    received: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.answers.productReceived.value')).getText();
        }
    },
    satisfied: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.answers.satisfiedWithProduct.value')).getText();
        }
    },
    quality: {
        get: function () {
            return element.all(by.repeater('($index, itemReport) in report').column('itemReport.answers.qualityOfProduct.value')).getText();
        }
    },
    sortBy: {
        value: function(className, order) {
            var toBeSorted = element(by.css('.padded-multi-line-5.' + className));
            toBeSorted.click();
            if (order === 'asc') {
                toBeSorted.click();
            }
        }
    }

});

module.exports = new ItemFeedbackReportPage;

function fillSelect2Chosen(id, input) {
    element(by.id(id)).click();
    element(by.css('.select2-input.select2-focused')).clear().sendKeys(input);
    element(by.css('.select2-results li')).click();
}