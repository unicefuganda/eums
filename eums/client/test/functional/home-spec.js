'use strict';

describe('Home Page', function () {
    var loginPage, homePage, responsePage;

    describe('Admin User', function () {
        beforeEach(function () {
            //TODO: make tests faster by loging in once and browser.get('/') in the beforeEach
            loginPage = require('./pages/login-page');
            browser.get('/');//needed because login page does not contain angularjs
            homePage = loginPage.loginWithCredentials('admin', 'admin');

        });

        afterEach(function () {
            loginPage.logout();
        });


        it('should get global stats on map', function () {
            browser.sleep(5000);
            expect(homePage.mapLocation.getText()).toEqual('');
            expect(homePage.numberSent.getText()).toEqual('17');
            expect(homePage.numberDelivered.getText()).toEqual('13');
            expect(homePage.numberNotDelivered.getText()).toEqual('4');
        });

        it('should click on wakiso district', function () {
            browser.sleep(5000);
            homePage.clickMapLayer('wakiso');
            browser.sleep(5000);
            expect(homePage.mapLocation.getText()).toEqual('Responses for WAKISO');
            expect(homePage.getMapZoomLevel()).toBe(10);
            expect(homePage.numberSent.getText()).toEqual('3');
            expect(homePage.numberDelivered.getText()).toEqual('3');
            expect(homePage.numberNotDelivered.getText()).toEqual('0');
        });

        it('when I click on district number of responses should be 10 or less', function () {
            browser.sleep(5000);
            homePage.clickMapLayer('wakiso');
            browser.sleep(5000);
            homePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toBeLessThan(6);
            })
        });

        it('should highlight a layer', function () {
            browser.sleep(5000)
            homePage.highLightMapLayer('wakiso');
            browser.sleep(5000);
            expect(homePage.getHighlightedLayerName()).toEqual('wakiso');
            expect(homePage.getHighlightedStyle('wakiso')).toEqual({ fillColor: '#FDAE61', fillOpacity: 0.6, weight: 1 });
        });

        it('responses panel should have a link to more details', function () {
            browser.sleep(5000);
            homePage.clickMapLayer('wakiso');
            browser.sleep(5000);
            expect(homePage.responsesPageLink.getText()).toEqual('View All Responses');
        });

        it('should navigate to detail responses page when page link is clicked', function () {
            browser.sleep(5000);
            homePage.clickMapLayer('wakiso');
            browser.sleep(5000);
            responsePage = homePage.goToResponseDetailsPage();
            browser.sleep(5000);

            expect(responsePage.header.getText()).toEqual('All responses for WAKISO district');
            responsePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toEqual(3);
            })
        });

        it('should search for "no" product received in Wakiso district', function () {
            browser.sleep(5000);
            homePage.clickMapLayer('wakiso');
            browser.sleep(5000);
            responsePage = homePage.goToResponseDetailsPage();
            browser.sleep(5000);
            responsePage.searchResponsesFor('no');
            responsePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toEqual(0);
            })
        });

        it('should search for "yes" product received in Wakiso district', function () {
            var expectedItems = ['IEHK2006,kit,suppl.1-drugs', 'Safety box f.used syrgs/ndls 5lt/BOX-25'];
            browser.sleep(5000);
            homePage.clickMapLayer('wakiso');
            browser.sleep(5000);
            responsePage = homePage.goToResponseDetailsPage();
            browser.sleep(5000);
            responsePage.searchResponsesFor('yes');
            responsePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toEqual(3);
                rows.forEach(function (row) {
                    row.getText().then(function (text) {
                        expect(expectedItems).toContain(text);
                    });
                });
            });
        });
    });

    describe('IP User', function () {
        beforeEach(function () {
            loginPage = require('./pages/login-page');
            homePage = loginPage.loginWithCredentials('wakiso', 'wakiso');

        });

        afterEach(function () {
            loginPage.logout();
        });


        it('should get global stats on map only for IP', function () {
            browser.sleep(5000);
            expect(homePage.mapLocation.getText()).toEqual('');
            expect(homePage.numberSent.getText()).toEqual('3');
            expect(homePage.numberDelivered.getText()).toEqual('3');
            expect(homePage.numberNotDelivered.getText()).toEqual('0');
        });
    });
});
