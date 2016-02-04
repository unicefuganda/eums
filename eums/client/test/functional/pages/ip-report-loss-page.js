var IpReportLossPage = function () {
};

IpReportLossPage.prototype = Object.create({}, {

    visit: {
        value: function (itemId) {
            browser.get('/#/deliveries-by-ip/' + itemId + '/report-loss');
        }
    },

    itemDescription: {
        get: function () {
            return element(by.id('itemNameLabel')).getText();
        }
    },

    quantityAvailable: {
        get: function () {
            return element(by.id('qty-available-label')).getText();
        }
    },

    selectQuantityLost: {
        value: function (input) {
            element(by.id('quantity-selected-0')).clear().sendKeys(input);
        }
    },

    saveLosses: {
        value: function () {
            element(by.id('save-losses')).click();
        }
    },

    totalSelectedQuantity: {
        get: function () {
            return element(by.id('total-selected-quantity')).getText();
        }
    },

    toastMessage: {
        get: function () {
            return element(by.repeater('message in messages')).getText();
        }
    }
});

module.exports = new IpReportLossPage;