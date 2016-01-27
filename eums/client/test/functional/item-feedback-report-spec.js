'use strict';

var itemFeedbackReport = require('./pages/item-feedback-report-page.js');
var loginPage = require('./pages/login-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Item Feedback Report', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        itemFeedbackReport.visit();
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

    it('should search the Item report by district', function () {
        itemFeedbackReport.searchByDistrict('Wakiso');
        expect(itemFeedbackReport.resultsCount).toEqual(10);
    });

    it('should sort by value', function () {
        ftUtils.wait(5000);
        itemFeedbackReport.sortBy('value', 'desc');

        expect(itemFeedbackReport.itemDescriptions).toContain('Another Funny Item');
        expect(itemFeedbackReport.programmes).toContain('AAASpecial Programme');
        expect(itemFeedbackReport.implementingPartners).toContain('WAKISO DHO');
        expect(itemFeedbackReport.orderNumbers).toContain('2014111');
        expect(itemFeedbackReport.quantitiesShipped).toContain('10');
        expect(itemFeedbackReport.values).toContain('$200.00');
    });
});
