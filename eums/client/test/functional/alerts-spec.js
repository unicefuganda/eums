'use strict';

var loginPage = require('./pages/login-page.js');
var alertsPage = require('./pages/alerts-page.js');
var ipDeliveriesPage = require('./pages/ip-shipments-page.js');


describe('Alerts', function () {
    var purchaseOrder = '12345';

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

        expect(alertsPage.firstAlert).toContain(purchaseOrder);
        expect(alertsPage.firstAlert).toContain('NOT RECEIVED');
        expect(alertsPage.firstAlert).toContain('Wakiso DHO');
        expect(alertsPage.firstAlert).toContain('John Doe');

        alertsPage.resolveAlert();
        expect(alertsPage.secondAlert).toContain('Resolved');

        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');
        ipDeliveriesPage.visit();
        ipDeliveriesPage.searchForShipment(purchaseOrder);

        expect(ipDeliveriesPage.deliveries.count()).toBe(1);
    });
});
