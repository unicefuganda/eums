'use strict';

var itemFeedbackReport = require('./pages/item-feedback-report-page.js');
var loginPage = require('./pages/login-page.js');

xdescribe('Item Feedback Report', function () {

    it('should show the Item Feedback report', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();

        expect(itemFeedbackReport.itemDescriptions).toContain('Safety box f.used syrgs/ndls 5lt/BOX-25');
        expect(itemFeedbackReport.programmes).toContain('YI107 - PCR 3 KEEP CHILDREN SAFE');
        expect(itemFeedbackReport.implementingPartners).toContain('PADER DHO');
        expect(itemFeedbackReport.consignees).toContain('RAKAI DHO');
        expect(itemFeedbackReport.orderNumbers).toContain('12345');
        expect(itemFeedbackReport.quantitiesShipped).toContain('100');
        expect(itemFeedbackReport.values).toContain('$7.14');
        expect(itemFeedbackReport.amountReceived).toContain('50');
        expect(itemFeedbackReport.dateOfReceipt).toContain('10-Jun-2014');
        expect(itemFeedbackReport.productReceived).toContain('YES');
        expect(itemFeedbackReport.productReceived).toContain('NO');
        expect(itemFeedbackReport.qualityOfProduct).toContain('DAMAGED');
        expect(itemFeedbackReport.qualityOfProduct).toContain('EXPIRED');
        expect(itemFeedbackReport.qualityOfProduct).toContain('GOOD');
        expect(itemFeedbackReport.satisfiedWithProduct).toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-ok-sign eums-text-color-ok');
        expect(itemFeedbackReport.satisfiedWithProduct).toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-remove-sign eums-text-color-no');
    });

    it('should search the Item report by item description', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();

        itemFeedbackReport.search('IEHK2006,kit,basic unit');
        expect(itemFeedbackReport.itemDescriptions).toContain('IEHK2006,kit,basic unit');
        expect(itemFeedbackReport.resultsCount).toEqual(3);
    });

    it('should search the Item report by programme', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();

        itemFeedbackReport.search('sample programme');
        expect(itemFeedbackReport.programmes).toContain('sample programme');
        expect(itemFeedbackReport.resultsCount).toEqual(8);
    });

    it('should search the Item report by Order Number', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();

        itemFeedbackReport.search('12345');
        expect(itemFeedbackReport.orderNumbers).toContain('12345');
        expect(itemFeedbackReport.resultsCount).toEqual(10);
    });
});