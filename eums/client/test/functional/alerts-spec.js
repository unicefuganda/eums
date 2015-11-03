'use strict';

var loginPage = require('./pages/login-page.js');
var alertsPage = require('./pages/alerts-page.js');

describe('Alerts', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        alertsPage.visit();
    });

    it('should show retrigger button when unreceived alert', function () {
        expect(alertsPage.retriggerBtns.count()).toEqual(1);
    });

    it('should retrigger delivery', function() {
        alertsPage.retrigger();

        expect(alertsPage.retriggerBtns.get(0).getAttribute('disabled')).toBeTruthy();
    });

    it('should show alert for waybill that was not received', function () {
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
