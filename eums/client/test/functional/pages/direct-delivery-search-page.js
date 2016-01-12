var functionalTestUtils = require('./../functional-test-utils.js');

var DirectDeliverySearchPage = function () {
};

DirectDeliverySearchPage.prototype = Object.create({}, {
    url: {
        get: function () {
            return '/#/direct-delivery';
        }
    },

    visit: {
        value: function () {
            browser.get(this.url);
            var EC = protractor.ExpectedConditions;
            var fadingModal = element(by.css('.modal-backdrop.fade'));
            var ordersHaveLoaded = EC.stalenessOf(fadingModal);
            browser.wait(ordersHaveLoaded, 5000, "Timeout exceeded while loading release orders");
        }
    },

    searchByPurchaseOrderNumber: {
        value: function (purchaseOrder) {
            element(by.model('searchTerm.purchaseOrder')).sendKeys(purchaseOrder);
        }
    },
    clearPurchaseOrderNumber: {
        value: function () {
            element(by.model('searchTerm.purchaseOrder')).clear();
        }
    },

    searchByItemDescription: {
        value: function (itemDescription) {
            element(by.model('searchTerm.itemDescription')).sendKeys(itemDescription);
        }
    },
    clearItemDescription: {
        value: function () {
            element(by.model('searchTerm.itemDescription')).clear();
        }
    },

    searchByProgramme: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-programme-container', searchTerm);
        }
    },
    clearProgramme: {
        value: function() {
            clearSelect2Chosen('filter-programme-container');
        }
    },

    searchByDistrict: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-district-container', searchTerm);
        }
    },
    clearDistrict: {
        value: function() {
            clearSelect2Chosen('filter-district-container');
        }
    },

    searchByIP: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            fillSelect2Chosen('filter-ip-container', searchTerm);
        }
    },
    clearIP: {
        value: function() {
            clearSelect2Chosen('filter-ip-container');
        }
    },

    searchByFromDate: {
        value: function (fromDate) {
            element(by.model('searchTerm.fromDate')).sendKeys(fromDate);
        }
    },
    clearFromDate: {
        value: function () {
            element(by.model('searchTerm.fromDate')).clear();
        }
    },

    searchByToDate: {
        value: function (toDate) {
            element(by.model('searchTerm.toDate')).sendKeys(toDate);
        }
    },
    clearToDate: {
        value: function () {
            element(by.model('searchTerm.toDate')).clear();
        }
    },

    verifyPOExists: {
        value: function (pONumber) {
            var poNumber = element(by.linkText(pONumber));
            expect(poNumber.isPresent()).toBeTruthy();
        }
    },
    clickOutSideToChangeFocus: {
        value: function () {
            element(by.linkText('Next')).click();
        }
    }
});

module.exports = new DirectDeliverySearchPage;

function fillSelect2Chosen(id, input) {
    element(by.id(id)).click();
    element(by.css('.select2-input.select2-focused')).clear().sendKeys(input);
    element(by.css('.select2-results li')).click();
}

function clearSelect2Chosen(id) {
    element(by.id(id)).click();
    element(by.css('.select2-input.select2-focused')).clear();
}