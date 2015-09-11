var AlertsPage = function () {};
var EC = protractor.ExpectedConditions;

AlertsPage.prototype = Object.create({}, {
    url: { get: function () { return '#/alerts'; }},

    visit: { value: function () {
        browser.get(this.url);
        waitForPageToLoad();
    }},

    firstAlert: { get: function () { return element.all(by.repeater('($index, alert) in alerts')).get(0).getText(); }},

    resolveAlert: { value: function (remark) {
        element.all(by.css('.resolve-alert-button')).get(0).click();
        waitForModalToLoad();

        alertModal.$('textarea').clear().sendKeys(remark);
        element.all(by.partialButtonText('Mark as resolved')).get(0).click();
    }},

    viewResolutionDetails: { value: function () {
        element.all(by.css('.resolve-alert-button.resolved')).get(1).click();
        waitForModalToLoad();
    }},

    alertResolutionRemarks: { get: function () {
        return element.all(by.repeater('($index, alert) in alerts').column('alert.remarks')).getText();
    }}
});

module.exports = new AlertsPage;

function waitForPageToLoad() {
    var spinner = element(by.css('#loading'));
    var screenHasLoaded = EC.invisibilityOf(spinner);
    browser.wait(screenHasLoaded, 5000, "Timeout exceeded while waiting for screen to load");
}

function waitForModalToLoad() {
    alertModal = element(by.id('resolve-alert-modal-0'));
    resolvedAlertModal = element(by.id('resolved-alert-modal-1'));
    var modalHasLoaded = EC.or(EC.visibilityOf(alertModal), EC.visibilityOf(resolvedAlertModal));
    browser.wait(modalHasLoaded, 5000, "Timeout exceeded while waiting for modal to load");
}