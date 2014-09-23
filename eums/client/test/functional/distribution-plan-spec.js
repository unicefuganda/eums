'use strict';

describe('supply plan', function () {
    var distributionPlanPage;
    var homePage;


    beforeEach(function () {
        browser.get('/');
        browser.ignoreSynchronization = true;
        homePage = require('./pages/home-page');
        distributionPlanPage = homePage.navigateToDistributionPlanTab();

    });

    it('should add contact', function () {
        var time = Date.now().toString();
        var phoneNumber = time.substring(4);

        distributionPlanPage.addContact({firstName: 'Tunji', lastName: 'Sola', phone: '+256'+ phoneNumber});

        expect(homePage.getHomeNavClass()).toEqual('active');
    });

    it('should show error when contact is NOT added', function () {
        distributionPlanPage.addInvalidContact({firstName: 'Tunji', lastName: 'Sola', phone: '778934543'});

        expect(distributionPlanPage.errorSpan.getText()).toEqual('Phone number format is wrong');
    });

});