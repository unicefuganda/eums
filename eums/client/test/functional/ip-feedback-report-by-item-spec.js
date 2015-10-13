'use strict';

var ftUtils = require('./functional-test-utils.js');
var loginPage = require('./pages/login-page.js');
var ipFeedbackReportByItemPage = require('./pages/ip-feedback-report-by-item-page.js');

describe('IP Feedback Report By Item', function () {

    it('should filter by programme, ip, item description, Purchase Order Number or waybill', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        ipFeedbackReportByItemPage.visit();

        ftUtils.waitForPageToLoad();
        ipFeedbackReportByItemPage.filterByProgramme('sample programme');

        expect(ipFeedbackReportByItemPage.outComes.count()).toEqual(2);

        ipFeedbackReportByItemPage.clearProgramme();

        expect(ipFeedbackReportByItemPage.outComes.count()).toBeGreaterThan(2);

        ipFeedbackReportByItemPage.filterByConsignee('KAABONG');

        expect(ipFeedbackReportByItemPage.outComes.count()).toEqual(2);

        ipFeedbackReportByItemPage.clearConsignee();

        expect(ipFeedbackReportByItemPage.outComes.count()).toBeGreaterThan(2);

        ipFeedbackReportByItemPage.filterByItemDescription('Therapeutic spread,sachet 92g/CAR-150');

        expect(ipFeedbackReportByItemPage.outComes.count()).toEqual(1);

        ipFeedbackReportByItemPage.clearItemDescription();

        expect(ipFeedbackReportByItemPage.outComes.count()).toBeGreaterThan(2);

        ipFeedbackReportByItemPage.filterByPoWaybill('12345');

        expect(ipFeedbackReportByItemPage.outComes.count()).toBeGreaterThan(2);

        ipFeedbackReportByItemPage.filterByProgramme('YI107 - PCR 3 KEEP CHILDREN SAFE');
        ipFeedbackReportByItemPage.filterByItemDescription('Therapeutic spread,sachet 92g/CAR-150');

        expect(ipFeedbackReportByItemPage.outComes.count()).toEqual(0);

        ipFeedbackReportByItemPage.clearItemDescription();
        ipFeedbackReportByItemPage.clearProgramme();

        expect(ipFeedbackReportByItemPage.outComes.count()).toBeGreaterThan(2);
    });

});
