'use strict';

describe('Login Page', function () {
    var loginPage;
    var homePage;

    beforeEach(function () {
        loginPage = require('./pages/login-page.js');
        homePage = require('./pages/home-page.js')
    });

    it('should show the login form', function () {
        loginPage.visit();
        expect(loginPage.welcomeMessage.isPresent()).toBeTruthy();
    });

    it('should redirect to home page after login with valid credentials', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        expect(homePage.pageTitle).toEqual('Supply End User Monitoring System');
    });
});
