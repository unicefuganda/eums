var AlertsPage = function () {};

AlertsPage.prototype = Object.create({}, {
    url: { get: function () { return '#/alerts'; }},

    visit: { value: function () {
        browser.get(this.url);
        waitForPageToLoad();
    }},

    statusForWaybill: {
        value: function (waybillNumber) {
            return element.all(by.repeater('alert in alerts')).get(0).getText();
        }},

    resolutionForWaybill: { value: function (waybillNumber) { return false; }}
});

module.exports = new AlertsPage;

function waitForPageToLoad() {
    var EC = protractor.ExpectedConditions;
    var spinner = element(by.css('#loading'));
    var screenHasLoaded = EC.invisibilityOf(spinner);
    browser.wait(screenHasLoaded, 5000, "Timeout exceeded while waiting for screen to load");
}