'use strict';

var loginPage = require('./pages/login-page.js');
var contactsPage = require('./pages/contacts-page.js');

describe('Contacts', function () {

    beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        contactsPage.visit();
    });
    describe('Testing Contact displays', function () {

        it('Existing contacts should be shown on the contacts page', function () {
            expect(contactsPage.contactCount).toEqual(1);
            expect(contactsPage.contactFirstNames).toContain('John');
            expect(contactsPage.contactLastNames).toContain('Doe');
            expect(contactsPage.contactPhoneNumbers).toContain('+256771234567');
        });

        it('Searching for contacts should show only relevant results', function () {
            contactsPage.searchForThisContact('Non-existent Contact');
            expect(contactsPage.contactCount).toEqual(0);

            contactsPage.searchForThisContact('John');
            expect(contactsPage.contactCount).toEqual(1);
        });
    });
});
