'use strict';

var itemFeedbackReport = require('./pages/item-feedback-report-page.js');
var loginPage = require('./pages/login-page.js');

describe('Item Feedback Report', function () {

    it('should show the Item Feedback report', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();
        expect(itemFeedbackReport.itemDescriptions).toContain('Item 297');
        expect(itemFeedbackReport.programmes).toContain('Special Programme');
        expect(itemFeedbackReport.implementingPartners).toContain('Consignee 62');
        expect(itemFeedbackReport.consignees).toContain('AMUDAT DHO');
        expect(itemFeedbackReport.orderNumbers).toContain('2014111');
        expect(itemFeedbackReport.quantitiesShipped).toContain('7');
        expect(itemFeedbackReport.values).toContain('$140.00');
        expect(itemFeedbackReport.amountReceived).toContain('7');
        expect(itemFeedbackReport.dateOfReceipt).toContain('29-Sep-2014');
        expect(itemFeedbackReport.productReceived).toContain('YES');
        expect(itemFeedbackReport.productReceived).toContain('NO');
        expect(itemFeedbackReport.qualityOfProduct).toContain('GOOD');
        expect(itemFeedbackReport.satisfiedWithProduct).toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-ok-sign eums-text-color-ok');
        expect(itemFeedbackReport.satisfiedWithProduct).toContain('glyphicon glyphicon-size-17 glyphicon-top-5 glyphicon-remove-sign eums-text-color-no');
    });

    it('should search the Item report by item description', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();

        itemFeedbackReport.searchByItemDescription('MUAC,Child 11.5 Red/PAC-50');
        expect(itemFeedbackReport.itemDescriptions).toContain('MUAC,Child 11.5 Red/PAC-50');
        expect(itemFeedbackReport.resultsCount).toEqual(3);
    });

    it('should search the Item report by programme', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();

        itemFeedbackReport.searchByProgramme('Special Programme');
        expect(itemFeedbackReport.programmes).toContain('Special Programme');
        expect(itemFeedbackReport.resultsCount).toEqual(1);
    });

    it('should search the Item report by Order Number', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();

        itemFeedbackReport.searchByWaybill('12345');
        expect(itemFeedbackReport.orderNumbers).toContain('12345');
        expect(itemFeedbackReport.resultsCount).toBeGreaterThan(6);
    });

    it('should search the Item report by recipient type', function() {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();

        itemFeedbackReport.searchByRecipientType('MIDDLE_MAN');
        expect(itemFeedbackReport.distributionStage).toContain('MIDDLE_MAN');
        expect(itemFeedbackReport.resultsCount).toEqual(1);
    });
});