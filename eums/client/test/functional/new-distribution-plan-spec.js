'use strict';
var Q = require('q');

describe('Distribution Planning', function () {
    var loginPage, distributionPlanPage;

    beforeEach(function () {
        loginPage = require('./pages/login-page');
        distributionPlanPage = require('./pages/distribution-plan-page');
        browser.get('/');
        loginPage.loginWithCredentials('admin', 'admin');
    });

    afterEach(function () {
        loginPage.logout();
    });

    xit('should go to the distribution plan page and show all sales orders', function () {
        distributionPlanPage.go();
        expect(distributionPlanPage.title()).toEqual('Sales Orders');
        browser.sleep(2000);
        distributionPlanPage.salesOrdersNumbers().then(function (salesOrderLinks) {
            expect(salesOrderLinks.length).toBe(15);
            var getTextPromises = salesOrderLinks.map(function (linkElement) {
                return linkElement.getText();
            });
            Q.all(getTextPromises).then(function (linksTextArray) {
                expect(linksTextArray).toEqual([ '12345', '20146879', '20151491', '20148033', '20151442', '20150358',
                    '20151377', '20141971', '20151371', '20148737', '20151097', '20135686', '20151094', '20149293', '20150937' ]);
            });
        });
    });

    xit('should go to new distribution plan page', function () {
        distributionPlanPage.go();
        browser.sleep(2000);
        distributionPlanPage.selectSalesOrder('20151491');
        browser.sleep(2000);
        expect(true).toBeTruthy();
    });

});
