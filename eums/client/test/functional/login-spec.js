'use strict';

describe('Login', function () {
    var loginPage;


    beforeEach(function () {
        loginPage = require('./pages/login-page');
    });

    afterEach(function () {
        loginPage.logout();
    });

    it('should go to login page', function () {
        browser.get('/');
        expect(loginPage.welcomeMessageIsPresent()).toBeTruthy();
    });

    it('should redirect to home page after login with correct credentials', function () {
        var homePage = loginPage.loginWithCredentials('admin', 'admin');
        expect(homePage.pageTitle()).toEqual('Supply End User Monitoring System');
    });
});
