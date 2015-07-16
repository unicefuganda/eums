'use strict';

var loginPage = require('./pages/login-page.js');
var directDeliveryPage = require('./pages/direct-delivery-page.js');

describe('Direct Delivery - Single IP', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        directDeliveryPage.visit();
    });

    it('should save a single IP direct delivery', function () {
        directDeliveryPage.selectPurchaseOrderByNumber('81026395');
        
        expect(directDeliveryPage.programmeName).toContain('PCR: 123 - Test Outcome 1');

        directDeliveryPage.selectSingleIP();

        expect(directDeliveryPage.purchaseOrderType).toContain('ZLC');
        expect(directDeliveryPage.purchaseOrderTotalValue).toContain('$2,362.02');
        
        expect(directDeliveryPage.purchaseOrderItemCount).toEqual(5);
        expect(directDeliveryPage.purchaseOrderItemMaterialNumbers).toContain('SL004638');
        expect(directDeliveryPage.purchaseOrderItemDescriptions).toContain("Children's Rights & Busi Principles Info");
        expect(directDeliveryPage.purchaseOrderItemQuantities).toContain('500.00');
        expect(directDeliveryPage.purchaseOrderItemValues).toContain('$267.58');
        expect(directDeliveryPage.purchaseOrderItemBalances).toContain('500');
        expect(directDeliveryPage.purchaseOrderItemDeliveryValues).toContain('$267.58');

        directDeliveryPage.firstRowQuantityShipped.clear().sendKeys('250');

        expect(directDeliveryPage.purchaseOrderItemDeliveryValues).toContain('$133.79');
    });
});

