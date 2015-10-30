'use strict';

var endUserFeedbackReport = require('./pages/end-user-feedback-report-page.js');
var loginPage = require('./pages/login-page.js');

describe('End User Feedback Report', function () {

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