'use strict';

var loginPage = require('./pages/login-page.js');
var ipReportLossPage = require('./pages/ip-report-loss-page.js');

describe('IP Report Loss Damage', function () {

    var reportLossItemId = 289;

    it('Set up to ensure that IP has items in their warehouse', function () {
        loginPage.visit();
        loginPage.loginAs('wakiso', 'wakiso');

        ipReportLossPage.visit(reportLossItemId);

        expect(ipReportLossPage.itemName).toBe('Item Name: Three-pronged power cables');
        //expect(ipReportLossPage.itemAvailableQty).toBe('Quantity Available: 50');
    });
});