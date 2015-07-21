var IpDirectDeliveryPage = function () {};

IpDirectDeliveryPage.prototype = Object.create({}, {
    url: { get: function () { return '#/ip-direct-delivery'; }},

    visit: { value: function () {
        browser.get(this.url);
    }},

    purchaseOrderCount: { get: function () { return element.all(by.repeater('purchaseOrder in purchaseOrders')).count(); }},

    searchBar: { get:  function () { return element(by.id('filter')); }},

    searchForThisPurchaseOrder: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }},
    selectPurchaseOrderByNumber: { value: function (text) { element(by.linkText(text)).click(); }},

    selectItem: { value: function (item) {
        waitForLoadingToComplete();
        element(by.css('#select-purchase-order')).click();

        waitForLoadingToComplete();
        element(by.css("#select-purchase-order option[label='" + item + "']")).click();
    }},

    addNewConsignee: { value: function () {
        waitForLoadingToComplete();
        element(by.id('addNewConsignee')).click();

        var EC = protractor.ExpectedConditions;
        var addConsigneeModal = element(by.id('add-consignee-modal'));
        var modalHasLoaded = EC.visibilityOf(addConsigneeModal);
        browser.wait(modalHasLoaded, 5000, "Timeout exceeded while loading modal");
    }},
    setConsigneeName: { value: function (input) {
        element(by.model('consignee.name')).clear().sendKeys(input);
    }},
    setConsigneeLocation: { value: function (input) {
        element(by.model('consignee.location')).clear().sendKeys(input);
    }},
    setConsigneeRemarks: { value: function (input) {
        element(by.model('consignee.remarks')).clear().sendKeys(input);
    }},
    saveConsignee: { value: function () {
        var EC = protractor.ExpectedConditions;
        var addConsigneeModal = element(by.id('add-consignee-modal'));
        var modalhasFaded = EC.invisibilityOf(addConsigneeModal);

        element(by.id('saveConsigneeBtn')).click();
        browser.wait(modalhasFaded, 5000, "Timeout exceeded while waiting for modal to fade");
    }}
});

module.exports = new IpDirectDeliveryPage;

function waitForLoadingToComplete () {
    var EC = protractor.ExpectedConditions;
    var fadingModal = element(by.css('.modal-backdrop.fade'));
    var itemsHaveLoaded = EC.stalenessOf(fadingModal);
    browser.wait(itemsHaveLoaded, 5000, "Timeout exceeded while loading item");
}