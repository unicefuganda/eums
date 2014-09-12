'use strict';

describe('supply plan', function () {
    var supplyPlanPage;

    beforeEach(function () {
        supplyPlanPage = require('./pages/supply-plan-page');
    });

    it('should go to home page', function () {
        browser.get('/');
        expect(supplyPlanPage.getText()).toEqual('EUMS Angular client is working');
    });
});