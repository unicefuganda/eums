var IpShipmentsPage = function () {};

IpShipmentsPage.prototype = Object.create({}, {
    url: { get: function () { return '#/ip-deliveries'; }},
    visit: { value: function () {
        browser.get(this.url);
    }},

    searchBar: { get: function () {
        return element(by.id('filter'));
    }},

    searchForShipment: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
        var EC = protractor.ExpectedConditions;
        var loadingModal = element.all(by.css('.modal.fade')).get(0);
        var shipmentsHaveLoaded = EC.invisibilityOf(loadingModal);
        browser.wait(shipmentsHaveLoaded, 5000, "Timeout waiting to shipments to load");
    }},


    viewDeliveryDetails: { value: function () {
       element.all(by.css('.viewDeliveryDetailsBtn')).get(0).click();
    }},
    specifyDeliveryAsReceived: { value: function () {
        element(by.id('deliveryConfirmationSelect')).$('[value="1"]').click();
    }},
    specifyDeliveryReceiptDate: { value: function (date) {
        element(by.css('#answer-2 input')).sendKeys(date);
    }},
    specifyDeliveryConditionAsGood: { value: function () {
        element(by.css('#answer-3 select')).$('[value="1"]').click()
    }},
    specifyDeliverySatisfactionAsYes: { value: function () {
        element(by.css('#answer-4 select')).$('[value="1"]').click()
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

        var EC = protractor.ExpectedConditions;
        var remarksModal = element(by.id("add-remark-answer-modal-" + rowIndex));
        var remarksModalHasLoaded = EC.visibilityOf(remarksModal);
        var remarksModalHasExited = EC.invisibilityOf(remarksModal);
        browser.wait(remarksModalHasLoaded, 5000, "Timeout waiting for remarks modal to load");

        element(by.css("#add-remark-answer-modal-" + rowIndex + " textarea")).clear().sendKeys(value);
        element(by.partialButtonText('OK')).click();
        browser.wait(remarksModalHasExited, 5000, "Timeout waiting for remarks modal to exit");
    }},

    saveItemConfirmation: { value: function () {
        element(by.id('saveBtn')).click();
    }}

});

module.exports = new IpShipmentsPage;
