'use strict'

var navbar = require('./pages/navbar.js');
var loginPage = require('./pages/login-page.js');
var importDataPage = require('./pages/import-data-page.js');
var usersPage = require('./pages/users-page.js');
var contactsPage = require('./pages/contacts-page.js');


xdescribe('Navigation', function () {

    describe('UNICEF Administrator', function () {

        it('should view and navigate to the reports section', function () {
            navbar.goToIPFeedbackReportPage();
            expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/ip-feedback-report-by-item');

            navbar.goToEndUserFeedbackReportPage();
            expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/end-user-feedback-report');

            navbar.goToIPStockReportPage();
            expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/#/reports');
        });

        it('should view and navigate to the admin section', function () {
            loginPage.visit();
            loginPage.loginAs('admin', 'admin');

            navbar.goToImportPage();
            expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + importDataPage.url);

            navbar.goToContactsPage();
            expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + contactsPage.url);

            navbar.goToUsersPage();
            expect(browser.getCurrentUrl()).toEqual(browser.baseUrl + usersPage.url);
        });

    });

    describe('Implementing Partner', function () {

    });

});