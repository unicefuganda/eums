'use strict';

describe('supply plan', function () {
    var supplyPlanPage;

    beforeEach(function () {
        supplyPlanPage = require('./pages/home-page');
    });

    it('should go to home page', function () {
        browser.ignoreSynchronization = true;
        browser.get('/');
        browser.waitForAngular();
        expect(supplyPlanPage.elementisPresent()).toBeTruthy();
    });
});