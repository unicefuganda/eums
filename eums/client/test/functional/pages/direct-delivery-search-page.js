var DirectDeliverySearchPage = function () {};

DirectDeliverySearchPage.prototype = Object.create({}, {
    url: { get: function () { return '/#/direct-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
        var EC = protractor.ExpectedConditions;
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var ordersHaveLoaded = EC.stalenessOf(fadingModal);
        browser.wait(ordersHaveLoaded, 5000, "Timeout exceeded while loading release orders");
    }},
     searchFromDate: { value: function (fromDate) {
        element(by.model('fromDate')).sendKeys(fromDate);
    }},
    searchToDate: { value: function (toDate) {
        element(by.model('toDate')).sendKeys(toDate);
    }},
     clearFromDate: { value: function () {
        element(by.model('fromDate')).clear();
    }},
    clearToDate: { value: function () {
        element(by.model('toDate')).clear();
    }},
    verifyPOExists: { value: function (pONumber) {
        var poNumber = element(by.linkText(pONumber));
        expect(poNumber.isPresent()).toBeTruthy();
    }},
    clickOutSideToChangeFocus: {value: function(){
        element(by.linkText('Next')).click();
    }}
});

module.exports = new DirectDeliverySearchPage;
