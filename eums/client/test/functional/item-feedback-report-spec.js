'use strict';

var itemFeedbackReport = require('./pages/item-feedback-report-page.js');
var loginPage = require('./pages/login-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Item Feedback Report', function () {

     beforeAll(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();
    });

    it('should show the Item Feedback report', function () {
        expect(itemFeedbackReport.itemDescriptions).toContain('Another Funny Item');
        expect(itemFeedbackReport.programmes).toContain('AAASpecial Programme');
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

    it('should search the Item report by item description', function () {
        itemFeedbackReport.searchByItemDescription('Another Funny Item');
        expect(itemFeedbackReport.itemDescriptions).toContain('Another Funny Item');
        expect(itemFeedbackReport.resultsCount).toEqual(2);
    });

    it('should search the Item report by programme', function () {
        itemFeedbackReport.searchByProgramme('AAASpecial Programme');
        expect(itemFeedbackReport.programmes).toContain('AAASpecial Programme');
        expect(itemFeedbackReport.resultsCount).toEqual(2);
    });

    it('should search the Item report by Order Number', function () {
        itemFeedbackReport.searchByWaybill('12345');
        expect(itemFeedbackReport.orderNumbers).toContain('12345');
        expect(itemFeedbackReport.resultsCount).toBeGreaterThan(6);
    });

    it('should search the Item report by recipient type', function () {
        itemFeedbackReport.searchByRecipientType('Sub-consignee');
        expect(itemFeedbackReport.distributionStage).toContain('Sub-consignee');
        expect(itemFeedbackReport.resultsCount).toEqual(3);
    });

    it('should search the Item report by product received', function () {
        itemFeedbackReport.searchByReceived('No');
        expect(itemFeedbackReport.received).not.toContain('Yes');
        expect(itemFeedbackReport.resultsCount).toEqual(1);
    });

    it('should search the Item report by satisfied With Product', function () {
        itemFeedbackReport.searchBySatisfied('Yes');
        expect(itemFeedbackReport.satisfied).not.toContain('No');
        expect(itemFeedbackReport.resultsCount).toEqual(10);
    });

    it('should search the Item report by quality of product', function () {
        itemFeedbackReport.searchByQuality('DAMAGED');
        expect(itemFeedbackReport.quality).not.toContain('GOOD');
        expect(itemFeedbackReport.resultsCount).toEqual(2);
    });

    it('should sort by value', function() {

        ftUtils.wait(2500);

        itemFeedbackReport.sortBy('value', 'desc');

        expect(itemFeedbackReport.itemDescriptions).toContain('Another Funny Item');
        expect(itemFeedbackReport.programmes).toContain('AAASpecial Programme');
        expect(itemFeedbackReport.implementingPartners).toContain('Consignee 62');
        expect(itemFeedbackReport.orderNumbers).toContain('2014111');
        expect(itemFeedbackReport.quantitiesShipped).toContain('10');
        expect(itemFeedbackReport.values).toContain('$200.00');
    });
});
