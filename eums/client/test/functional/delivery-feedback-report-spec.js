'use strict';

var report = require('./pages/ip-feedback-report-by-delivery-page.js');
var loginPage = require('./pages/login-page.js');

describe('Delivery Feedback Report', function () {

    it('should show the Item Feedback report', function() {
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
});
