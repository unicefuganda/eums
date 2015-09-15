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
        expect(alertsPage.firstAlert).toContain('Waybill');
        expect(alertsPage.firstAlert).toContain('123456');
        expect(alertsPage.firstAlert).toContain('NOT RECEIVED');
        expect(alertsPage.firstAlert).toContain('Some Consignee Name');
        expect(alertsPage.firstAlert).toContain('Some Contact Name');
    });

    it('should resolve alerts', function () {
        alertsPage.resolveAlert('This is now resolved');
        expect(alertsPage.firstAlert).toContain('View Resolution');

        alertsPage.viewResolutionDetails();
        expect(alertsPage.alertResolutionRemarks).toContain('This is now resolved');
    });
});