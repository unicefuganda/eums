var ContactsPage = function () {};

ContactsPage.prototype = Object.create({}, {
    url: { get: function () { return '#/contacts'; }},
    visit: { value: function () {
        browser.get(this.url);
    }},

    contactFirstNames: { get: function () { return element.all(by.repeater('contact in contacts').column('contact.firstName')).getText(); }},
    contactLastNames: { get: function () { return element.all(by.repeater('contact in contacts').column('contact.lastName')).getText(); }},
    contactPhoneNumbers: { get: function () { return element.all(by.repeater('contact in contacts').column('contact.phone')).getText(); }},

    contactCount: { get: function () { return element.all(by.repeater('contact in contacts')).count(); }},

    searchBar: { get: function () { return element(by.id('filter')); }},
    searchForThisContact: { value: function (searchTerm) {
        this.searchBar.clear().sendKeys(searchTerm);
    }}
});

module.exports = new ContactsPage;