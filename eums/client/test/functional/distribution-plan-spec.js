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

    xit('should add contact', function () {
        distributionPlanPage.addContact({firstname: 'Tunji', lastname: 'Sola', phone: '+256778934546'});

        expect(homePage.getHomeNavClass()).toEqual('active');
    });

    xit('should show error when contact is NOT added', function () {
        distributionPlanPage.addInvalidContact({firstname: 'Tunji', lastname: 'Sola', phone: '778934543'});

        expect(distributionPlanPage.errorSpan.getText()).toEqual('Phone number format is wrong');
    });

});