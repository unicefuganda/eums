var AlertsPage = function () {};
var EC = protractor.ExpectedConditions;

AlertsPage.prototype = Object.create({}, {
    url: { get: function () { return '/#/alerts'; }},

    visit: { value: function () {
        browser.get(this.url);
        waitForPageToLoad();
    }},

    firstAlert: { get: function () { return element.all(by.repeater('($index, alert) in alerts')).get(0).getText(); }},
    secondAlert: { get: function () { return element.all(by.repeater('($index, alert) in alerts')).get(1).getText(); }},

    alertStatuses: { get: function () { return element.all(by.css('.alerts-issue')).getText(); }},
    alertOrderNumbers: { get: function () { return element.all(by.repeater('($index, alert) in alerts').column('alert.orderNumber')).getText(); }},
    alertItems: { get: function () { return element.all(by.repeater('($index, alert) in alerts').column('alert.itemDescription')).getText(); }},
    alertOrderDate: { get: function () { return element.all(by.repeater('($index, alert) in alerts').column('alert.dateShipped')).getText(); }},
    alertOrderValue: { get: function () { return element.all(by.repeater('($index, alert) in alerts').column('alert.totalValue')).getText(); }},
    alertReporter: { get: function () { return element.all(by.repeater('($index, alert) in alerts').column('alert.contact.contactName')).getText(); }},
    alertIP: { get: function () { return element.all(by.repeater('($index, alert) in alerts').column('alert.consigneeName')).getText(); }},
    alertLocation: { get: function () { return element.all(by.repeater('($index, alert) in alerts').column('alert.location')).getText(); }},

    retriggerBtns: { get: function() { return element.all(by.css('.retrigger-btn')); }},

    retrigger: { value: function () {
        element.all(by.css('.retrigger-btn')).get(0).click();
    }},

    resolveAlert: { value: function () {
        element.all(by.css('.resolve-alert-button')).get(0).click();
        waitForModalToLoad(0);
        element.all(by.css('.btn btn-primary resolve')).click();
    }},

    viewResolutionDetails: { value: function () {
        element(by.id('resolved-alert-link-1')).click();
        waitForModalToLoad(1);
    }},

    alertResolutionRemarks: { get: function () {
        return element.all(by.repeater('($index, alert) in alerts').column('alert.remarks')).getText();
    }},

    goToItemAlerts: {value: function() {
        element(by.id('item-alerts-button')).click();
    }}
});

module.exports = new AlertsPage;

function waitForPageToLoad() {
    var spinner = element(by.css('#loading'));
    var screenHasLoaded = EC.invisibilityOf(spinner);
    browser.wait(screenHasLoaded, 5000, "Timeout exceeded while waiting for screen to load");
}

function waitForModalToLoad(elementIndex) {
    //resolvedAlertModal = element(by.id('resolved-alert-modal-1'));
    var resolveModal = element(by.id('resolve-confirm-modal-' + elementIndex));
    var modalHasLoaded = EC.visibilityOf(resolveModal);
    browser.wait(modalHasLoaded, 5000, "Timeout exceeded while waiting for modal to load");
}
