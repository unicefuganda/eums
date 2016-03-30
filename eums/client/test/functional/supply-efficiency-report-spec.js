'use strict';

var supplyEfficiencyReportPage = require('./pages/supply-efficiency-report-page.js');
var loginPage = require('./pages/login-page.js');
var ftUtils = require('./functional-test-utils.js');

describe('Supply Efficiency Report', function () {

    var setFilterTimeRangeForTest = function () {
        supplyEfficiencyReportPage.filterByStartDate('01-Jan-2015');
        supplyEfficiencyReportPage.filterByEndDate('31-Dec-2015');
    };

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        supplyEfficiencyReportPage.visit();
        ftUtils.waitForPageToLoad();
        setFilterTimeRangeForTest();
    });

    describe('Delivery report Page', function () {

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

        describe('On filter by outcome and/or Item', function () {

            it('should show records filtered by outcome', function () {
                supplyEfficiencyReportPage.filterBy('outcome', 'YI107 - PCR 3 KEEP CHILDREN SAFE');

                expect(supplyEfficiencyReportPage.reportsCount).toEqual(2);
                expect(supplyEfficiencyReportPage.deliveryDates.get(1).getText()).toEqual('11-Jul-2015');
                expect(supplyEfficiencyReportPage.ipNames.get(1).getText()).toEqual('WAKISO DHO');
                expect(supplyEfficiencyReportPage.districts.get(1).getText()).toEqual('Bukomansimbi');
                expect(supplyEfficiencyReportPage.unicefValues.get(1).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipReceivedValues.get(1).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipConfirmed.get(1).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipReceivedDelays.get(1).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedValues.get(1).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedBalance.get(1).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserValueReceived.get(1).getText()).toEqual('62');
                expect(supplyEfficiencyReportPage.endUserConfirmed.get(1).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserDelayed.get(1).getText()).toEqual('1');
            });

            it('should show records filtered by both outcome and item', function () {
                supplyEfficiencyReportPage.filterBy('item', 'Safety box f.used syrgs/ndls 5lt/BOX-25');

                expect(supplyEfficiencyReportPage.reportsCount).toEqual(1);
                expect(supplyEfficiencyReportPage.deliveryDates.get(0).getText()).toEqual('11-Jul-2015');
                expect(supplyEfficiencyReportPage.ipNames.get(0).getText()).toEqual('WAKISO DHO');
                expect(supplyEfficiencyReportPage.districts.get(0).getText()).toEqual('Bukomansimbi');
                expect(supplyEfficiencyReportPage.unicefValues.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipReceivedValues.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipConfirmed.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipReceivedDelays.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedValues.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedBalance.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserValueReceived.get(0).getText()).toEqual('12');
                expect(supplyEfficiencyReportPage.endUserConfirmed.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserDelayed.get(0).getText()).toEqual('-285');
            });
        });
    });

    describe('Item View', function () {

        beforeEach(function () {
            supplyEfficiencyReportPage.goToItemView();
            ftUtils.waitForPageToLoad();
            setFilterTimeRangeForTest();
        });

        it('should show the item reports header', function () {
            supplyEfficiencyReportPage.contextualHeaderColumns.then(function (columns) {
                expect(columns[0].getText()).toEqual('ITEM');
            });
        });

        it('should show the item related subheader by default', function () {
            supplyEfficiencyReportPage.subHeaderContextualColumns.then(function (columns) {
                expect(columns[0].getText()).toContain('Description');
                expect(columns[1].getText()).toEqual('Material Code');
            });
        });

        it('should show a correct count of report data', function () {
            expect(supplyEfficiencyReportPage.reportsCount).toEqual(5);
        });

        it('should show item details in rows', function () {
            expect(supplyEfficiencyReportPage.itemDescriptions.get(0).getText()).toEqual('Fact sheet2013 A4 2013 Full colour 2013 double s');
            expect(supplyEfficiencyReportPage.materialCodes.get(0).getText()).toEqual('SL004638');
            expect(supplyEfficiencyReportPage.unicefValues.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.ipReceivedValues.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.ipConfirmed.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.ipReceivedDelays.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.ipDistributedValues.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.ipDistributedBalance.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.endUserValueReceived.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.endUserConfirmed.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.endUserDelayed.get(0).getText()).toEqual('144');
        });

        describe('On filter by IP', function () {

            beforeEach(function () {
                supplyEfficiencyReportPage.filterBy('ip', 'WAKISO DHO');
            });

            it('should show records filtered by IP', function () {
                expect(supplyEfficiencyReportPage.reportsCount).toEqual(4);
                expect(supplyEfficiencyReportPage.itemDescriptions.get(3).getText()).toEqual('Therapeutic spread,sachet 92g/CAR-150');
                expect(supplyEfficiencyReportPage.materialCodes.get(3).getText()).toEqual('S0060240');
                expect(supplyEfficiencyReportPage.unicefValues.get(3).getText()).toEqual('30');
                expect(supplyEfficiencyReportPage.ipReceivedValues.get(3).getText()).toEqual('30');
                expect(supplyEfficiencyReportPage.ipConfirmed.get(3).getText()).toEqual('100');
                expect(supplyEfficiencyReportPage.ipReceivedDelays.get(3).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedValues.get(3).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedBalance.get(3).getText()).toEqual('30');
                expect(supplyEfficiencyReportPage.endUserValueReceived.get(3).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserConfirmed.get(3).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserDelayed.get(3).getText()).toEqual('0');
            });
        });
    });

    describe('Outcome View', function () {

        beforeEach(function () {
            supplyEfficiencyReportPage.goToOutcomeView();
            ftUtils.waitForPageToLoad();
            setFilterTimeRangeForTest();
        });

        it('should show the outcome reports header', function () {
            supplyEfficiencyReportPage.contextualHeaderColumns.then(function (columns) {
                expect(columns[0].getText()).toEqual('OUTCOME');
            });
        });

        it('should show the outcome related subheader by default', function () {
            supplyEfficiencyReportPage.subHeaderContextualColumns.then(function (columns) {
                expect(columns[0].getText()).toContain('Outcome Name');
            });
        });

        it('should show a correct count of report data', function () {
            expect(supplyEfficiencyReportPage.reportsCount).toEqual(2);
        });

        it('should show outcome details in rows', function () {
            expect(supplyEfficiencyReportPage.programmeNames.get(0).getText()).toEqual('sample programme');
            expect(supplyEfficiencyReportPage.unicefValues.get(0).getText()).toEqual('181');
            expect(supplyEfficiencyReportPage.ipReceivedValues.get(0).getText()).toEqual('181');
            expect(supplyEfficiencyReportPage.ipConfirmed.get(0).getText()).toEqual('100');
            expect(supplyEfficiencyReportPage.ipReceivedDelays.get(0).getText()).toEqual('144');
            expect(supplyEfficiencyReportPage.ipDistributedValues.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.ipDistributedBalance.get(0).getText()).toEqual('181');
            expect(supplyEfficiencyReportPage.endUserValueReceived.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.endUserConfirmed.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.endUserDelayed.get(0).getText()).toEqual('0');
        });

        describe('On filter by PO/Waybill', function () {

            beforeEach(function () {
                supplyEfficiencyReportPage.input('po-or-waybill', '555');
            });

            it('should show records filtered by po or waybill', function () {
                expect(supplyEfficiencyReportPage.reportsCount).toEqual(0);
            });
        });
    });

    describe('PO/Waybill View', function () {

        beforeEach(function () {
            supplyEfficiencyReportPage.goToPoWayBillView();
            ftUtils.waitForPageToLoad();
            setFilterTimeRangeForTest();
        });

        it('should show the po or waybill reports header', function () {
            supplyEfficiencyReportPage.contextualHeaderColumns.then(function (columns) {
                expect(columns[0].getText()).toEqual('PO / WAYBILL');
            });
        });

        it('should show the po or waybill related subheader by default', function () {
            supplyEfficiencyReportPage.subHeaderContextualColumns.then(function (columns) {
                expect(columns[0].getText()).toContain('Doc. Number');
            });
        });

        it('should show a correct count of report data', function () {
            expect(supplyEfficiencyReportPage.reportsCount).toEqual(1);
        });

        it('should show po or waybill details in rows', function () {
            expect(supplyEfficiencyReportPage.orderNumbers.get(0).getText()).toEqual('12345');
            expect(supplyEfficiencyReportPage.orderTypes.get(0).getText()).toEqual('WB');
            expect(supplyEfficiencyReportPage.unicefValues.get(0).getText()).toEqual('242');
            expect(supplyEfficiencyReportPage.ipReceivedValues.get(0).getText()).toEqual('242');
            expect(supplyEfficiencyReportPage.ipConfirmed.get(0).getText()).toEqual('100');
            expect(supplyEfficiencyReportPage.ipReceivedDelays.get(0).getText()).toEqual('144');
            expect(supplyEfficiencyReportPage.ipDistributedValues.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.ipDistributedBalance.get(0).getText()).toEqual('242');
            expect(supplyEfficiencyReportPage.endUserValueReceived.get(0).getText()).toEqual('62');
            expect(supplyEfficiencyReportPage.endUserConfirmed.get(0).getText()).toEqual('25');
            expect(supplyEfficiencyReportPage.endUserDelayed.get(0).getText()).toEqual('1');
        });

        describe('On filter by District', function () {

            beforeEach(function () {
                supplyEfficiencyReportPage.filterBy('district', 'Adjumani');
            });

            it('should show records filtered by district', function () {
                expect(supplyEfficiencyReportPage.reportsCount).toEqual(0);
            });
        });
    });

    describe('IP View', function () {

        beforeEach(function () {
            supplyEfficiencyReportPage.goToIPView();
            ftUtils.waitForPageToLoad();
            setFilterTimeRangeForTest();
        });

        it('should show the ip reports header', function () {
            supplyEfficiencyReportPage.contextualHeaderColumns.then(function (columns) {
                expect(columns[0].getText()).toEqual('IMPLEMENTING PARTNER');
            });
        });

        it('should show the IP related subheader by default', function () {
            supplyEfficiencyReportPage.subHeaderContextualColumns.then(function (columns) {
                expect(columns[0].getText()).toContain('Name');
            });
        });

        it('should show a correct count of report data', function () {
            expect(supplyEfficiencyReportPage.reportsCount).toEqual(3);
        });

        it('should show IP details in rows', function () {
            expect(supplyEfficiencyReportPage.ipNames.get(0).getText()).toEqual('KAABONG DHO');
            expect(supplyEfficiencyReportPage.unicefValues.get(0).getText()).toEqual('151');
            expect(supplyEfficiencyReportPage.ipReceivedValues.get(0).getText()).toEqual('151');
            expect(supplyEfficiencyReportPage.ipConfirmed.get(0).getText()).toEqual('100');
            expect(supplyEfficiencyReportPage.ipReceivedDelays.get(0).getText()).toEqual('144');
            expect(supplyEfficiencyReportPage.ipDistributedValues.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.ipDistributedBalance.get(0).getText()).toEqual('151');
            expect(supplyEfficiencyReportPage.endUserValueReceived.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.endUserConfirmed.get(0).getText()).toEqual('0');
            expect(supplyEfficiencyReportPage.endUserDelayed.get(0).getText()).toEqual('0');
        });

        describe('On filter by start date', function () {

            beforeEach(function () {
                supplyEfficiencyReportPage.filterByStartDate('10-Jul-2014');
            });

            it('should show records filtered by start date', function () {
                expect(supplyEfficiencyReportPage.reportsCount).toEqual(10);
                expect(supplyEfficiencyReportPage.ipNames.get(0).getText()).toEqual('BUNDIBUGYO DHO');
                expect(supplyEfficiencyReportPage.unicefValues.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipReceivedValues.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipConfirmed.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipReceivedDelays.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedValues.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedBalance.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserValueReceived.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserConfirmed.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.endUserDelayed.get(0).getText()).toEqual('0');
            });
        });
    });

    describe('District View', function () {

        beforeEach(function () {
            supplyEfficiencyReportPage.goToDistrictView();
            ftUtils.waitForPageToLoad();
            setFilterTimeRangeForTest();
        });

        it('should show the district reports header', function () {
            supplyEfficiencyReportPage.contextualHeaderColumns.then(function (columns) {
                expect(columns[0].getText()).toEqual('DISTRICT');
            });
        });

        it('should show the district related subheader by default', function () {
            supplyEfficiencyReportPage.subHeaderContextualColumns.then(function (columns) {
                expect(columns[0].getText()).toContain('District Name');
            });
        });

        describe('On load', function () {

            it('should show a correct count of report data', function () {
                expect(supplyEfficiencyReportPage.reportsCount).toEqual(4);
            });

            it('should show district details in rows', function () {
                expect(supplyEfficiencyReportPage.locations.get(0).getText()).toEqual('Amuru');
                expect(supplyEfficiencyReportPage.unicefValues.get(0).getText()).toEqual('72');
                expect(supplyEfficiencyReportPage.ipReceivedValues.get(0).getText()).toEqual('72');
                expect(supplyEfficiencyReportPage.ipConfirmed.get(0).getText()).toEqual('100');
                expect(supplyEfficiencyReportPage.ipReceivedDelays.get(0).getText()).toEqual('144');
                expect(supplyEfficiencyReportPage.ipDistributedValues.get(0).getText()).toEqual('0');
                expect(supplyEfficiencyReportPage.ipDistributedBalance.get(0).getText()).toEqual('72');
                expect(supplyEfficiencyReportPage.endUserValueReceived.get(0).getText()).toEqual('12');
                expect(supplyEfficiencyReportPage.endUserConfirmed.get(0).getText()).toEqual('16');
                expect(supplyEfficiencyReportPage.endUserDelayed.get(0).getText()).toEqual('-285');

            });
        });

        describe('On filter by end date', function () {

            beforeEach(function () {
                supplyEfficiencyReportPage.filterByEndDate('10-Jul-2015');
            });

            it('should show no data', function () {
                expect(supplyEfficiencyReportPage.reportsCount).toEqual(0);
            });
        });
    });
});