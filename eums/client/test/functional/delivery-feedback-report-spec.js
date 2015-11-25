'use strict';

var report = require('./pages/ip-feedback-report-by-delivery-page.js');
var loginPage = require('./pages/login-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Delivery Feedback Report', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        report.visit();
    });

    it('should show the Delivery Feedback Report', function() {
        expect(report.received).toContain('YES');
        expect(report.shipmentDate).toContain('11-Jul-2015');
        expect(report.dateReceived).toContain('02-Dec-2015');
        expect(report.consignees).toContain('WAKISO DHO');
        expect(report.outcome).toContain('sample programme');
        expect(report.value).toContain('$30.00');

    });

    it('should sort by shipment date', function() {
        ftUtils.wait(1500);

        report.sortBy('shipment-date', 'desc');

        expect(report.shipmentDate).toContain('11-Jul-2015');
        expect(report.consignees).toContain('WAKISO DHO');
        expect(report.outcome).toContain('sample programme');
        expect(report.value).toContain('$30.00');
    });
});
