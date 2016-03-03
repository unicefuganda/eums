'use strict';

var loginPage = require('./pages/login-page.js');
var contactsPage = require('./pages/contacts-page.js');

describe('Contacts', function () {

    beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        contactsPage.visit();
    });

    it('Existing contacts should be shown on the contacts page', function () {
        expect(contactsPage.contactCount).toEqual(3);
        expect(contactsPage.contactFirstNames).toContain('John');
        expect(contactsPage.contactLastNames).toContain('Doe');
        expect(contactsPage.contactPhoneNumbers).toContain('+256771234567');
        expect(contactsPage.contactDistricts).toContain('wakiso');
        expect(contactsPage.contactIps).toContain('WAKISO DHO');
        expect(contactsPage.contactTypes).toContain('End user');
        expect(contactsPage.contactOutcomes).toContain('YI101 - PCR 1 KEEP CHILDREN LEARNING');
    });

    it('Searching for contacts by first or last name should show only relevant results', function () {
        contactsPage.searchForThisContact('Non-existent Contact');
        expect(contactsPage.contactCount).toEqual(0);

        contactsPage.searchForThisContact('John');
        expect(contactsPage.contactCount).toEqual(1);
    });

    it('Searching for contacts by district should show only relevant results', function () {
        contactsPage.searchByDistrict('wakiso');
        expect(contactsPage.contactCount).toEqual(1);
    });
});

describe('Contacts', function () {

    beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        contactsPage.visit();
    });

    it("IP's contacts should be shown on the contacts page", function () {
        expect(contactsPage.contactCount).toEqual(2);
        expect(contactsPage.contactFirstNames).toContain('John');
        expect(contactsPage.contactLastNames).toContain('Doe');
        expect(contactsPage.contactPhoneNumbers).toContain('+256771234567');
    });
});
