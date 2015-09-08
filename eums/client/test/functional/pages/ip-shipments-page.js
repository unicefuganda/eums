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
    }}

});

module.exports = new IpShipmentsPage;
