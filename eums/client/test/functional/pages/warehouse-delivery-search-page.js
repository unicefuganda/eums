var functionalTestUtils = require('./../functional-test-utils.js');

var WarehouseDeliverySearchPage = function () {
};

WarehouseDeliverySearchPage.prototype = Object.create({}, {
    url: {
        get: function () {
            return '/#/warehouse-delivery';
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

    searchByWaybillNumber: {
        value: function (purchaseOrder) {
            element(by.model('searchTerm.purchaseOrder')).sendKeys(purchaseOrder);
        }
    },
    clearWaybillNumber: {
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
            functionalTestUtils.fillSelect2Chosen('filter-programme-container', searchTerm);
        }
    },
    clearProgramme: {
        value: function() {
            functionalTestUtils.clearSelect2Chosen('filter-programme-container');
        }
    },

    searchByDistrict: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            functionalTestUtils.fillSelect2Chosen('filter-district-container', searchTerm);
        }
    },
    clearDistrict: {
        value: function() {
            functionalTestUtils.clearSelect2Chosen('filter-district-container');
        }
    },

    searchByIP: {
        value: function (searchTerm) {
            functionalTestUtils.wait(3000);
            functionalTestUtils.fillSelect2Chosen('filter-ip-container', searchTerm);
        }
    },
    clearIP: {
        value: function() {
            functionalTestUtils.clearSelect2Chosen('filter-ip-container');
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

    verifyROExists: {
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

module.exports = new WarehouseDeliverySearchPage;