'use strict';

describe('supply plan', function () {
    var supplyPlanPage;


    beforeEach(function () {
        supplyPlanPage = require('./pages/home-page');
//        browser.ignoreSynchronization = true;
    });
    
    it('should go to home page', function () {
        browser.get('/');
        expect(supplyPlanPage.elementisPresent()).toBeTruthy();
    });
});