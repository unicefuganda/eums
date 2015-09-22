var IpShipmentsPage = function () {};
var EC = protractor.ExpectedConditions;

IpShipmentsPage.prototype = Object.create({}, {
    url: { get: function () { return '/#/ip-deliveries'; }},
    visit: { value: function () {
        browser.get(this.url);
    }},

    searchBar: { get: function () {
        return element(by.id('filter'));
    }},

    searchForShipment: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
        waitForPageToLoad();
    }},


    viewDeliveryDetails: { value: function () {
       element.all(by.css('.viewDeliveryDetailsBtn')).get(0).click();
    }},
    specifyDeliveryAsReceived: { value: function () {
        element(by.id('deliveryConfirmationSelect')).$('[value="1"]').click();
    }},
    specifyDeliveryReceiptDate: { value: function (date) {
        element(by.css('#answer-2 input')).clear().sendKeys(date);
    }},
    specifyDeliveryConditionAsGood: { value: function () {
        element(by.css('#answer-3 select')).$('[value="1"]').click()
    }},
    specifyDeliveryConditionAsNotGood: { value: function () {
        element(by.css('#answer-3 select')).$('[value="0"]').click()
    }},
    specifyDeliverySatisfactionAsYes: { value: function () {
        element(by.css('#answer-4 select')).$('[value="1"]').click()
    }},
    specifyDeliverySatisfactionAsNo: { value: function () {
        element(by.css('#answer-4 select')).$('[value="0"]').click()
    }},
    addRemarks: { value: function (remarks) {
        element(by.css('#answer-5 textarea')).sendKeys(remarks);
    }},
    saveAndProceedToItemsInDelivery: { value: function () {
        element(by.id('deliveryConfirmYes')).click();
    }},


    specifyItemReceived: { value: function (rowIndex, value) {
        element.all(by.repeater('($index, node) in combinedDeliveryNodes')).get(rowIndex).$(".itemReceived option[label='"+ value +"']").click();
    }},
    specifyQtyReceived: { value: function (rowIndex, value) {
        element.all(by.repeater('($index, node) in combinedDeliveryNodes')).get(rowIndex).$("input").clear().sendKeys(value);
    }},
    specifyItemCondition: { value: function (rowIndex, value) {
        element.all(by.repeater('($index, node) in combinedDeliveryNodes')).get(rowIndex).$(".itemCondition option[label='"+ value +"']").click();
    }},
    specifyItemSatisfaction: { value: function (rowIndex, value) {
        element.all(by.repeater('($index, node) in combinedDeliveryNodes')).get(rowIndex).$(".itemSatisfaction option[label='"+ value +"']").click();
    }},
    addItemRemark: { value: function (rowIndex, value) {
        element.all(by.repeater('($index, node) in combinedDeliveryNodes')).get(rowIndex).$(".itemRemark button").click();

        var remarksModal = element(by.id("add-remark-answer-modal-" + rowIndex));
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var remarksModalHasLoaded = EC.visibilityOf(remarksModal);
        var remarksModalHasExited = EC.and(EC.invisibilityOf(remarksModal), EC.stalenessOf(fadingModal));

        browser.wait(remarksModalHasLoaded, 5000, "Timeout waiting for remarks modal to load");

        element(by.css("#add-remark-answer-modal-" + rowIndex + " textarea")).clear().sendKeys(value);
        element(by.partialButtonText('OK')).click();
        browser.wait(remarksModalHasExited, 5000, "Timeout waiting for remarks modal to exit");
    }},

    saveItemConfirmation: { value: function () {
        element(by.id('saveBtn')).click();
    }},
    goBackToShipmentsPage: { value: function () {
        element(by.id('backToShipmentsBtn')).click();
        waitForPageToLoad();
    }},


    itemConditions: { get: function () {
        return element.all(by.repeater('($index, node) in combinedDeliveryNodes')).get(0).$(".itemCondition").getText();
    }},
    itemSatisfactions: { get: function () {
        return element.all(by.repeater('($index, node) in combinedDeliveryNodes')).get(0).$(".itemSatisfaction").getText();
    }}

});

module.exports = new IpShipmentsPage;


waitForPageToLoad = function() {
    var loadingModal = element.all(by.css('.modal.fade')).get(0);
    var shipmentsHaveLoaded = EC.invisibilityOf(loadingModal);
    browser.wait(shipmentsHaveLoaded, 5000, "Timeout waiting to shipments to load");
};