var consigneesPage = function () {};

consigneesPage.prototype = Object.create({}, {
    url: { get: function () { return '/#/consignees'; }},

    visit: { value: function () {
        browser.get(this.url);
        var EC = protractor.ExpectedConditions;
        var fadingModal = element(by.css('.modal-backdrop.fade'));
        var loaded = EC.stalenessOf(fadingModal);
        browser.wait(loaded, 5000, "Timeout exceeded while loading consignees");
    }},

    consigneeNames: { get: function () { return element.all(by.repeater('consignee in consignees').column('consignee.name')).getText(); }},
    consigneeIDs: { get: function () { return element.all(by.repeater('consignee in consignees').column('consignee.customerId')).getText(); }},
    consigneeRemarks: { get: function () { return element.all(by.repeater('consignee in consignees').column('consignee.remarks')).getText(); }},
    consigneeLocations: { get: function () { return element.all(by.repeater('consignee in consignees').column('consignee.location')).getText(); }},
    consigneeCount: { get: function () { return element.all(by.repeater('consignee in consignees')).count(); }},
    consigneeTypeClass : { get: function () { return element(by.css('.consigneeType span')).getAttribute('class'); }},

    addConsignee: { value: function () { element(by.id('add-consignee')).click(); }},

    addConsigneeButton: { get: function () { return element(by.id('add-consignee')); }},
    editConsigneeButton: { get: function () { return element.all(by.css('.editBtn')).get(0); }},
    deleteConsigneeButton: { get: function () { return element.all(by.css('.deleteBtn')).get(0); }},

    editConsignee: { value: function () { element.all(by.css('.editBtn')).get(0).click(); }},
    deleteConsignee: { value: function () { element.all(by.css('.deleteBtn')).get(0).click(); }},
    saveConsignee: { value: function () { element.all(by.css('.saveBtn')).get(0).click(); }},
    cancelConsignee: { value: function () { element.all(by.css('.cancelBtn')).get(0).click(); }},

    confirmDeleteConsignee: { value: function () {
        var EC = protractor.ExpectedConditions;
        var deleteBtn = element(by.id('confirmDeleteConsignee'));
        var confirmationModal = EC.visibilityOf(deleteBtn);
        browser.wait(confirmationModal, 5000, "Timeout exceeded while loading confirmation Modal");
        deleteBtn.click();
    }},

    cancelDeleteConsignee: { value: function () { element(by.id('cancelDeleteConsignee')).click(); }},

    setConsigneeRemarks: { value: function (input) { element.all(by.model('consignee.remarks')).get(0).clear().sendKeys(input); }},
    setConsigneeName: { value: function (input) { element.all(by.model('consignee.name')).get(0).clear().sendKeys(input); }},
    setConsigneeLocation: { value: function (input) { element.all(by.model('consignee.location')).get(0).clear().sendKeys(input); }},

    searchFor: { value: function (searchTerm) { element(by.id('filter')).clear().sendKeys(searchTerm); }}

});

module.exports = new consigneesPage;
