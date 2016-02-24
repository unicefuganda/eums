var ContactsPage = function () {
};

ContactsPage.prototype = Object.create({}, {
    url: {
        get: function () {
            return '/#/contacts';
        }
    },
    visit: {
        value: function () {
            browser.get(this.url);
        }
    },

    contactFirstNames: {
        get: function () {
            return element.all(by.repeater('contact in contacts').column('contact.firstName')).getText();
        }
    },
    contactLastNames: {
        get: function () {
            return element.all(by.repeater('contact in contacts').column('contact.lastName')).getText();
        }
    },
    contactPhoneNumbers: {
        get: function () {
            return element.all(by.repeater('contact in contacts').column('contact.phone')).getText();
        }
    },

    contactDistricts: {
        get: function () {
            return element.all(by.id('contact.districts')).getText();
        }
    },

    contactIps: {
        get: function () {
            return element.all(by.id('contact.ips')).getText();
        }
    },

    contactTypes: {
        get: function () {
            return element.all(by.id('contact.types')).getText();
        }
    },

    contactOutcomes: {
        get: function () {
            return element.all(by.id('contact.outcomes')).getText();
        }
    },

    contactCount: {
        get: function () {
            return element.all(by.repeater('contact in contacts')).count();
        }
    },

    searchBar: {
        get: function () {
            return element(by.id('filter'));
        }
    },
    searchForThisContact: {
        value: function (searchTerm) {
            this.searchBar.clear().sendKeys(searchTerm);
        }
    },

    clickAddContact: {
        value: function () {
            element(by.css('#input-contact button')).click();
            waitForContactModalCondition(visibilityFunction);
        }
    },

    closeContactModal: {
        value: function () {
            element(by.css('#add-contact-modal button.close')).click();
            waitForContactModalCondition(invisibilityFunction);
        }
    },

    contactModal: {
        get: function () {
            return element(by.css('#add-contact-modal .modal-header'));
        }
    }
});

module.exports = new ContactsPage;

var visibilityFunction = function (conditions, modal) {
    return conditions.visibilityOf(modal);
};

var invisibilityFunction = function (conditions, modal) {
    var fadingModal = element(by.css('.modal-backdrop.fade'));
    return conditions.and(conditions.invisibilityOf(modal), conditions.stalenessOf(fadingModal));
};

var waitForContactModalCondition = function (conditionFunction) {
    var EC = protractor.ExpectedConditions;
    var contactModal = element(by.id('add-contact-modal'));
    var modalCondition = conditionFunction(EC, contactModal);
    browser.wait(modalCondition, 5000, "Timeout exceeded while waiting for modal condition");
};
