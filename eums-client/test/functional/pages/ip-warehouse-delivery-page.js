var IpWarehouseDeliveryPage = function () {
};

IpWarehouseDeliveryPage.prototype = Object.create({}, {
    url: { get: function () {
        return '#/ip-deliveries';
    }},

    visit: { value: function () {
        browser.get(this.url);
    }},

    waybillCount: { get: function () {
        return element.all(by.repeater('releaseOrder in releaseOrders')).count();
    }},

    searchBar: { get: function () {
        return element(by.id('filter'));
    }},

    searchForThisWaybill: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }},
    confirmDelivery: { value: function () {
        element(by.xpath("//button[@ng-click='confirm(delivery)']")).click();
    }},
    selectAnswer: { value: function () {
        element(by.model('answers[0].value')).$('[value="1"]').click();

    }},
    deliveryDate: { value: function () {
        element(by.css('#answer-2 input')).sendKeys('18/08/2015');
    }},
    itemCondition: { value: function () {
        element(by.css('#answer-3 select')).$('[value="1"]').click()
    }},
    satisfiedByItem: { value: function () {
        element(by.css('#answer-4 select')).$('[value="1"]').click()
    }},
    extraComment: { value: function () {
        element(by.css('#answer-5 textarea')).sendKeys('Items received and happy with it');
    }},
     confirmItems: { value: function () {
        element(by.id('deliveryConfirmYes')).click();
    }}

});

module.exports = new IpWarehouseDeliveryPage;
