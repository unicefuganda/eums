'use strict';

var reportsPage = require('./pages/reports-page.js');
var endUserFeedbackReport = require('./pages/end-user-feedback-report-page.js');
var loginPage = require('./pages/login-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Reports', function () {

    it('should show the IP stock report', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        reportsPage.visit();
        ftUtils.waitForPageToLoad();

        reportsPage.selectConsignee('kaabong');
        ftUtils.waitForPageToLoad();

        expect(reportsPage.totalReceived).toContain('$87.14');
        expect(reportsPage.totalDispensed).toContain('$0.00');
        expect(reportsPage.totalBalance).toContain('$87.14');

        expect(reportsPage.stockDocumentNumbers).toContain('12345');
        expect(reportsPage.stockReceivedValues).toContain('$87.14');
        expect(reportsPage.stockBalances).toContain('$87.14');

        reportsPage.selectFirstPO();
        expect(reportsPage.itemCodes).toContain('S0060240');
        expect(reportsPage.itemCodes).toContain('S0145620');
        expect(reportsPage.itemDescriptions).toContain('Therapeutic spread,sachet 92g/CAR-150');
        expect(reportsPage.itemDescriptions).toContain('MUAC,Child 11.5 Red/PAC-50');
        expect(reportsPage.itemDeliveredQty).toContain('80');
        expect(reportsPage.itemDeliveredQty).toContain('500');
        expect(reportsPage.itemConfirmedQty).toContain('80');
        expect(reportsPage.itemConfirmedQty).toContain('500');
        expect(reportsPage.itemDeliveryDate).toContain('11-Jul-2015');
        expect(reportsPage.itemBalances).toContain('80');
        expect(reportsPage.itemBalances).toContain('500');

    });

    it('should show the End User Feedback report', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        endUserFeedbackReport.visit();

        expect(endUserFeedbackReport.itemDescriptions).toContain('Safety box f.used syrgs/ndls 5lt/BOX-25');
        expect(endUserFeedbackReport.programmes).toContain('YI107 - PCR 3 KEEP CHILDREN SAFE');
        expect(endUserFeedbackReport.implementingPartners).toContain('PADER DHO');
        expect(endUserFeedbackReport.consignees).toContain('RAKAI DHO');
        expect(endUserFeedbackReport.orderNumbers).toContain('12345');
        expect(endUserFeedbackReport.quantitiesShipped).toContain('100');
        expect(endUserFeedbackReport.values).toContain('$7.14');
        expect(endUserFeedbackReport.amountReceived).toContain('50');
        expect(endUserFeedbackReport.dateOfReceipt).toContain('10-Jun-2014');
        expect(endUserFeedbackReport.productReceived).toContain('YES');
        expect(endUserFeedbackReport.productReceived).toContain('NO');
        expect(endUserFeedbackReport.qualityOfProduct).toContain('DAMAGED');
        expect(endUserFeedbackReport.qualityOfProduct).toContain('EXPIRED');
        expect(endUserFeedbackReport.qualityOfProduct).toContain('GOOD');
        expect(endUserFeedbackReport.satisfiedWithProduct).toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-ok-sign eums-text-color-ok');
        expect(endUserFeedbackReport.satisfiedWithProduct).toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-remove-sign eums-text-color-no');

    });

    it('should search the End User report by item description', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        endUserFeedbackReport.visit();

        endUserFeedbackReport.search('IEHK2006,kit,basic unit');
        expect(endUserFeedbackReport.itemDescriptions).toContain('IEHK2006,kit,basic unit');
        expect(endUserFeedbackReport.resultsCount).toEqual(3);
    });

    it('should search the End User report by programme', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        endUserFeedbackReport.visit();

        endUserFeedbackReport.search('sample programme');
        expect(endUserFeedbackReport.programmes).toContain('sample programme');
        expect(endUserFeedbackReport.resultsCount).toEqual(8);
    });

    it('should search the End User report by Order Number', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        endUserFeedbackReport.visit();

        endUserFeedbackReport.search('12345');
        expect(endUserFeedbackReport.orderNumbers).toContain('12345');
        expect(endUserFeedbackReport.resultsCount).toEqual(10);
    });
});