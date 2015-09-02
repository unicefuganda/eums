var ConfirmItemByItem = function () {
};

ConfirmItemByItem.prototype = Object.create({}, {
    url: { get: function () {
        return '#items-delivered-to-ip/51';
    }},
    visit: { value: function () {
        browser.get(this.url);
    }},
    waitForModalToLoad: {value: function () {
        var EC = protractor.ExpectedConditions;
        var modalControl = element(by.css('.modal.fade'));
        var modal = EC.visibilityOf(modalControl);
        browser.wait(modal, 5000, "Timeout when modal doesn't load");

    }},
    waitForModalToExit: {value: function () {
        var EC = protractor.ExpectedConditions;
        var modalControl = element(by.css('.modal.fade'));
        var modal = EC.invisibilityOf(modalControl);
        browser.wait(modal, 5000, "Timeout when modal doesn't exit");

    }},
    isItemReceived: { value: function () {
        element(by.model('node.answers[0].value')).$('[value="1"]').click();

    }},
    itemCondition: { value: function () {
        element(by.model('node.answers[2].value')).$('[value="4"]').click();
    }},
    satisfiedByItem: { value: function () {
        element(by.model('node.answers[3].value')).$('[value="1"]').click();
    }},
    enterRemarks: { value: function () {
        element(by.css('[ng-click="addRemark($index)"]')).click();

    }},
    saveRemarks: { value: function () {
        element(by.css('#add-remark-answer-modal-0 textarea')).sendKeys('Goods were received in good Conditions');
    }},
    exitRemarksModal: { value: function () {
        element(by.partialButtonText('OK')).click();
    }},
    saveItems: { value: function () {
        element(by.id('saveBtn')).click();
    }},
    itemCondition: { value: function () {
        element(by.css('#condition-0 select')).$('[value="1"]').click();

    }}

});

module.exports = new ConfirmItemByItem;
