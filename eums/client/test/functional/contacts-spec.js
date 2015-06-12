'use strict';

describe('Contacts Page', function () {
    var loginPage;

    it('should go to the contacts page', function () {
        loginPage = require('./pages/login-page');

        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        element(by.id('admin-nav')).click();
        element(by.id('contact-nav')).click();

        expect(element(by.css('.page-header')).getText()).toEqual('Contacts');
        expect(element(by.id('add-contact')).getText()).toEqual('Add Contact');
    });
});