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

    fit('should show the Delivery Feedback Report', function () {
        expect(report.received).toContain('YES');
        expect(report.shipmentDate).toContain('11-Jul-2015');
        expect(report.dateReceived).toContain('02-Dec-2015');
        expect(report.consignees).toContain('WAKISO DHO');
        expect(report.outcome).toContain('sample programme');
        expect(report.value).toContain('$30.00');

    });

    fit('should sort by shipment date', function () {
        ftUtils.wait(3000);

        report.sortBy('shipment-date', 'desc');

        expect(report.shipmentDate).toContain('11-Jul-2015');
        expect(report.consignees).toContain('WAKISO DHO');
        expect(report.outcome).toContain('sample programme');
        expect(report.value).toContain('$30.00');
    });

    it('should search report by received', function () {
        report.searchByReceived('Yes');
        expect(report.received).toContain('YES');
        expect(report.received).not.toContain('NO');

        report.searchByReceived('No');
        expect(report.received).toContain('NO');
        expect(report.received).not.toContain('YES');
    });

    it('should search report by satisfied', function () {
        report.searchBySatisfied('Yes');
        expect(report.satisfied).toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-ok-sign eums-text-color-ok');
        expect(report.satisfied).not.toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-remove-sign eums-text-color-no');

        report.searchBySatisfied('No');
        expect(report.satisfied).toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-remove-sign eums-text-color-no');
        expect(report.satisfied).not.toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-ok-sign eums-text-color-ok');
    });

    it('should search report by good condition', function () {
        report.searchByGoodCondition('Yes');
        expect(report.goodCondition).toContain('GOOD');
        expect(report.goodCondition).not.toContain('BAD');

        report.searchByGoodCondition('No');
        expect(report.goodCondition).toContain('BAD');
        expect(report.goodCondition).not.toContain('GOOD');
    });
});
