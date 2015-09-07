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
        browser.wait(modal, 10000, "Timeout when modal doesn't exit");

    }},
     waitForElementToLoad: {value: function (id) {
        var EC = protractor.ExpectedConditions;
        var modalControl = element(by.id(id));
        var modal = EC.visibilityOf(modalControl);
        browser.wait(modal, 5000, "Timeout when modal doesn't load");

    }},
    waitForThisElementToExit: {value: function (id) {
        var EC = protractor.ExpectedConditions;
        var modalControl = element(by.id(id));
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
    itemConditionFirst: { value: function () {
        element(by.css('#condition-0 select')).$('[value="4"]').click();

    }},
    itemConditionSecond: { value: function () {
        element(by.css('#condition-1 select')).$('[value="4"]').click();

    }},
    itemConditionThird: { value: function () {
        element(by.css('#condition-2 select')).$('[value="4"]').click();

    }},
    itemConditionFourth: { value: function () {
        element(by.css('#condition-3 select')).$('[value="4"]').click();

    }},
    itemSatisfiedFirst: { value: function () {
        element(by.css('#satisfied-0 select')).$('[value="1"]').click();

    }},
    itemSatisfiedSecond: { value: function () {
        element(by.css('#satisfied-1 select')).$('[value="1"]').click();

    }},
    itemSatisfiedThird: { value: function () {
        element(by.css('#satisfied-2 select')).$('[value="1"]').click();

    }},
    itemSatisfiedFourth: { value: function () {
        element(by.css('#satisfied-3 select')).$('[value="1"]').click();

    }},
       remarksFirst: { value: function () {
        element(by.css('#btn-0 button')).click();

    }},
      remarksSecond: { value: function () {
        element(by.css('#btn-1 button')).click();

    }},
     remarksThird: { value: function () {
        element(by.css('#btn-2 button')).click();

    }},
     remarksFourth: { value: function () {
        element(by.css('#btn-3 button')).click();

    }},
     enterRemarksFirst: { value: function (comment) {
        element(by.css('#add-remark-answer-modal-0 textarea')).sendKeys(comment);
    }},
      saveCommentsFirst: { value: function () {
        element(by.css('#add-remark-answer-modal-0 button')).click();

    }},
     enterRemarksSecond: { value: function (comment) {
        element(by.css('#add-remark-answer-modal-1 textarea')).sendKeys(comment);
    }},
      saveCommentsSecond: { value: function () {
        element(by.css('#add-remark-answer-modal-1 button')).click();

    }},
     enterRemarksThird: { value: function (comment) {
        element(by.css('#add-remark-answer-modal-2 textarea')).sendKeys(comment);
    }},
    enterRemarksFourth: { value: function (comment) {
        element(by.css('#add-remark-answer-modal-3 textarea')).sendKeys(comment);
    }},
      saveCommentsThird: { value: function () {
        element(by.css('#add-remark-answer-modal-2 button')).click();

    }},
     saveCommentsFourth: { value: function () {
        element(by.css('#add-remark-answer-modal-3 button')).click();

    }},
    saveRecords: {value: function(){
        element(by.id('saveBtn')).click();
    }}


});

module.exports = new ConfirmItemByItem;
