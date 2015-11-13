'use strict';

var supplyEfficiencyReportPage = require('./pages/supply-efficiency-report-page.js');
var loginPage = require('./pages/login-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Supply Efficiency Report', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        supplyEfficiencyReportPage.visit();
        ftUtils.waitForPageToLoad();

    });

    it('should show the delivery view by default', function () {
        supplyEfficiencyReportPage.contextualHeaderColumns.then(function (columns) {
            expect(columns[0].getText()).toEqual('DELIVERY');
        });
    });
    it('should show reports columns', function () {
        supplyEfficiencyReportPage.standardHeaderColumns.then(function (columns) {
            expect(columns[0].getText()).toEqual('UNICEF');
            expect(columns[1].getText()).toEqual('IP RECEIPT');
            expect(columns[2].getText()).toEqual('IP DISTRIBUTION');
            expect(columns[3].getText()).toEqual('END USER RECEIPT');
        });
    });

    it('should show the delivery related subheader by default', function () {
        supplyEfficiencyReportPage.subHeaderContextualColumns.then(function (columns) {
            expect(columns[0].getText()).toContain('Date');
            expect(columns[1].getText()).toEqual('IP');
            expect(columns[2].getText()).toEqual('District');
        });
    });
    it('should show standard report subheader columns', function () {
        supplyEfficiencyReportPage.subHeaderStandardColumns.then(function (columns) {
            expect(columns[0].getText()).toEqual('Value ($)');
            expect(columns[1].getText()).toEqual('Value ($)');
            expect(columns[2].getText()).toEqual('Confirmed (%)');
            expect(columns[3].getText()).toEqual('Transit (days)');
            expect(columns[4].getText()).toEqual('Value ($)');
            expect(columns[5].getText()).toEqual('Balance ($)');
            expect(columns[6].getText()).toEqual('Value ($)');
            expect(columns[7].getText()).toEqual('Confirmed (%)');
            expect(columns[8].getText()).toEqual('Transit (days)');
        });
    });

    it('should show a correct count of report data', function () {
        expect(supplyEfficiencyReportPage.reportsCount).toEqual(4);
    });

    it('should show delivery details in rows', function () {
        expect(supplyEfficiencyReportPage.deliveryDates.get(0).getText()).toEqual('11-Jul-2015');
        expect(supplyEfficiencyReportPage.ipNames.get(0).getText()).toEqual('RAKAI DHO');
        expect(supplyEfficiencyReportPage.districts.get(0).getText()).toEqual('Kaabong');
        expect(supplyEfficiencyReportPage.unicefValues.get(0).getText()).toEqual('61');
        expect(supplyEfficiencyReportPage.ipReceivedValues.get(0).getText()).toEqual('61');
        expect(supplyEfficiencyReportPage.ipConfirmed.get(0).getText()).toEqual('100');
        expect(supplyEfficiencyReportPage.ipReceivedDelays.get(0).getText()).toEqual('144');
        expect(supplyEfficiencyReportPage.ipDistributedValues.get(0).getText()).toEqual('0');
        expect(supplyEfficiencyReportPage.ipDistributedBalance.get(0).getText()).toEqual('61');
        expect(supplyEfficiencyReportPage.endUserValueReceived.get(0).getText()).toEqual('0');
        expect(supplyEfficiencyReportPage.endUserConfirmed.get(0).getText()).toEqual('0');
        expect(supplyEfficiencyReportPage.endUserDelayed.get(0).getText()).toEqual('0');

    });


});
