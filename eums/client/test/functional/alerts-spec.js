'use strict';

var loginPage = require('./pages/login-page.js');
var alertsPage = require('./pages/alerts-page.js');

describe('Alerts', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        alertsPage.visit();
    });

    it('should show alert for waybill that was not received', function () {
        expect(alertsPage.firstAlert).toContain('waybill');
        expect(alertsPage.firstAlert).toContain('123456');
        expect(alertsPage.firstAlert).toContain('NOT_RECEIVED');
    });
});