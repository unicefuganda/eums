'use strict';

describe('contacts page', function () {
    var loginPage;

    beforeEach(function () {
        loginPage = require('./pages/login-page');
        browser.ignoreSynchronization = true;
        browser.get('/');
        loginPage.loginWithCredentials('admin', 'admin');

    });

    afterEach(function () {
        loginPage.logout();
    });

    it('should go to the contacts page', function () {
        element(by.id('admin-nav')).click();
        element(by.id('contact-nav')).click();
        browser.sleep(2000);
        expect(element(by.css('.page-header')).getText()).toEqual('Contacts');
        expect(element(by.id('add-contact')).getText()).toEqual('Add Contact');
    });
});