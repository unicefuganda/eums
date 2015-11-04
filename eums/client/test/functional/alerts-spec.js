'use strict';

var loginPage = require('./pages/login-page.js');
var alertsPage = require('./pages/alerts-page.js');

describe('Alerts', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        alertsPage.visit();
    });

    it('should show, resolve and retrigger alerts', function () {
        expect(alertsPage.retriggerBtns.count()).toEqual(1);

        alertsPage.retrigger();
        expect(alertsPage.retriggerBtns.get(0).getText()).toBe('Retriggered');
        expect(alertsPage.retriggerBtns.get(0).getAttribute('disabled')).toBeTruthy();

        expect(alertsPage.firstAlert).toContain('123456');
        expect(alertsPage.firstAlert).toContain('NOT RECEIVED');
        expect(alertsPage.firstAlert).toContain('Some Consignee Name');
        expect(alertsPage.firstAlert).toContain('Some Contact Name');

        alertsPage.resolveAlert('This is now resolved');
        expect(alertsPage.firstAlert).toContain('View Resolution');

        alertsPage.viewResolutionDetails();
        expect(alertsPage.alertResolutionRemarks).toContain('This is now resolved');
        expect(alertsPage.retriggerBtns.count()).toEqual(0);
    });
});
