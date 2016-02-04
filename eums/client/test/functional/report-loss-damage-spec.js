'use strict';

var loginPage = require('./pages/login-page.js');
var ipReportLossPage = require('./pages/ip-report-loss-page.js');

describe('IP Report Loss Damage', function () {

    var reportLossItemId = 289;

    it('should report loss for one of their received deliveries', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');

        ipReportLossPage.visit(reportLossItemId);

        expect(ipReportLossPage.itemDescription).toBe('Item Name: Three-pronged power cables');
        expect(ipReportLossPage.quantityAvailable).toBe('Quantity Available: 50');
        expect(ipReportLossPage.totalSelectedQuantity).toBe('0');

        ipReportLossPage.selectQuantityLost('10');
        ipReportLossPage.saveLosses();

        //expect(ipReportLossPage.toastMessage).toContain('Loss reported successfully');
        //expect(ipReportLossPage.quantityAvailable).toBe('Quantity Available: 40');
    });
});