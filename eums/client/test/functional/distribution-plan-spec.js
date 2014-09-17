'use strict';

describe('supply plan', function () {
    var distributionPlanPage;
    var homePage;


    beforeEach(function () {
        browser.ignoreSynchronization = true;
        browser.get('/');
        homePage = require('./pages/home-page');
        distributionPlanPage = homePage.navigateToDistributionPlanTab();

    });

    it('should add contact', function () {
        distributionPlanPage.addContact({firstname: 'Tunji', lastname: 'Sola', phone: '+256778854556'});

        expect(homePage.getHomeNavClass()).toEqual('active');
    });

    it('should show error when contact is NOT added', function () {
        distributionPlanPage.addInvalidContact({firstname: 'Tunji', lastname: 'Sola', phone: '778934543'});

        expect(distributionPlanPage.errorSpan.getText()).toEqual('Phone number format is wrong');
    });

});