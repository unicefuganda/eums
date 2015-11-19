'use strict';

var report = require('./pages/ip-feedback-report-by-delivery-page.js');
var loginPage = require('./pages/login-page.js');

describe('Delivery Feedback Report', function () {

    it('should show the Delivery Feedback Report', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        report.visit();

        expect(report.received).toContain('YES');
        expect(report.shipmentDate).toContain('28-Sep-2014');
        expect(report.dateReceived).toContain('29-Sep-2014');
        expect(report.consignees).toContain('WAKISO DHO');
        expect(report.outcome).toContain('AAAYI105 - PCR 1 KEEP CHILDREN AND MOTHERS');
        expect(report.value).toContain('$300.00');

    });

    xit('should sort by shipment date', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        report.visit();
        report.sortBy('shipment date', 'desc');

        expect(report.received).toContain('YES');
        expect(report.shipmentDate).toContain('11-Jul-2015');
        expect(report.dateReceived).toContain('12/02/2015');
        expect(report.consignees).toContain('KAABONG DHO');
        expect(report.outcome).toContain('YI107 - PCR 3 KEEP CHILDREN SAFE');
        expect(report.value).toContain('$61.00');
    });
});
