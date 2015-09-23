'use strict';

var reportsPage = require('./pages/reports-page.js');
var loginPage = require('./pages/login-page.js');

describe('Reports', function () {

    it('should show the IP stock report', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        reportsPage.visit();

        reportsPage.selectConsignee('Adjumani');

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
        expect(reportsPage.itemDeliveryDate).toContain('2014-06-10');
        expect(reportsPage.itemBalances).toContain('30');
        expect(reportsPage.itemBalances).toContain('0');

    });

});