'use strict';

describe('supply plan', function () {
    var supplyPlanPage;

    beforeEach(function () {
        supplyPlanPage = require('./pages/home-page');
    });

    it('should go to home page', function () {
        browser.get('/');
        console.log('###################################');
        browser.waitForAngular();
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        expect(supplyPlanPage.elementisPresent()).toBeTruthy();
    });
});