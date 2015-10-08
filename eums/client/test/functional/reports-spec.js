'use strict';

var reportsPage = require('./pages/reports-page.js');
var endUserFeedbackReport = require('./pages/end-user-feedback-report-page.js');
var loginPage = require('./pages/login-page.js');

describe('Reports', function () {

    it('should show the IP stock report', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        reportsPage.visit();

        reportsPage.selectConsignee('Adjumani');

        expect(reportsPage.totalReceived).toContain('$7.14');
        expect(reportsPage.totalDispensed).toContain('$0.00');
        expect(reportsPage.totalBalance).toContain('$7.14');

        expect(reportsPage.stockDocumentNumbers).toContain('12345');
        expect(reportsPage.stockReceivedValues).toContain('7.143');
        expect(reportsPage.stockBalances).toContain('7.143');

        reportsPage.selectFirstPO();
        expect(reportsPage.itemCodes).toContain('S0782208');
        expect(reportsPage.itemCodes).toContain('SL004638');
        expect(reportsPage.itemDescriptions).toContain('Safety box f.used syrgs/ndls 5lt/BOX-25');
        expect(reportsPage.itemDescriptions).toContain('Fact sheet2013 A4 2013 Full colour 2013 double s');
        expect(reportsPage.itemDeliveredQty).toContain('30');
        expect(reportsPage.itemDeliveredQty).toContain('3');
        expect(reportsPage.itemConfirmedQty).toContain('30');
        expect(reportsPage.itemConfirmedQty).toContain('0');
        expect(reportsPage.itemDeliveryDate).toContain('10-06-2014');
        expect(reportsPage.itemBalances).toContain('30');
        expect(reportsPage.itemBalances).toContain('0');

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
        expect(endUserFeedbackReport.dateOfReceipt).toContain('6/10/2014');
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