'use strict';

describe('Home Page', function () {
    var loginPage, homePage, responsePage;

    describe('Admin User', function () {
        beforeEach(function () {
            loginPage = require('./pages/login-page.js');
            homePage = require('./pages/home-page.js');
            loginPage.visit();
            loginPage.loginAs('admin', 'admin');
        });

        it('should get global stats on map', function () {
            expect(homePage.mapLocation.getText()).toEqual('');
            expect(homePage.numberSent.getText()).toEqual('17');
            expect(homePage.numberDelivered.getText()).toEqual('13');
            expect(homePage.numberNotDelivered.getText()).toEqual('4');
        });

        it('should click on wakiso district', function () {
            homePage.clickMapLayer('wakiso');
            expect(homePage.mapLocation.getText()).toEqual('Responses for WAKISO');
            expect(homePage.getMapZoomLevel()).toBe(10);
            expect(homePage.numberSent.getText()).toEqual('3');
            expect(homePage.numberDelivered.getText()).toEqual('3');
            expect(homePage.numberNotDelivered.getText()).toEqual('0');
        });

        it('when I click on district number of responses should be 10 or less', function () {
            homePage.clickMapLayer('wakiso');
            homePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toBeLessThan(6);
            })
        });

        it('should highlight a layer', function () {
            homePage.highLightMapLayer('wakiso');
            expect(homePage.getHighlightedLayerName()).toEqual('wakiso');
            expect(homePage.getHighlightedStyle('wakiso')).toEqual({ fillColor: '#FDAE61', fillOpacity: 0.6, weight: 1 });
        });

        it('responses panel should have a link to more details', function () {
            homePage.clickMapLayer('wakiso');
            expect(homePage.responsesPageLink.getText()).toEqual('View All Responses');
        });

        it('should navigate to detail responses page when page link is clicked', function () {
            homePage.clickMapLayer('wakiso');
            responsePage = homePage.goToResponseDetailsPage();

            expect(responsePage.header.getText()).toEqual('All responses for WAKISO district');
            responsePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toEqual(3);
            })
        });

        it('should search for "no" product received in Wakiso district', function () {
            homePage.clickMapLayer('wakiso');
            responsePage = homePage.goToResponseDetailsPage();
            responsePage.searchResponsesFor('no');
            responsePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toEqual(0);
            })
        });

        it('should search for "yes" product received in Wakiso district', function () {
            var expectedItems = ['IEHK2006,kit,suppl.1-drugs', 'Safety box f.used syrgs/ndls 5lt/BOX-25'];
            homePage.clickMapLayer('wakiso');
            responsePage = homePage.goToResponseDetailsPage();
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
            loginPage = require('./pages/login-page.js');
            homePage = require('./pages/home-page.js');
            loginPage.visit();
            loginPage.loginAs('wakiso', 'wakiso');
        });

        it('should get global stats on map only for IP', function () {
            expect(homePage.mapLocation.getText()).toEqual('');
            expect(homePage.numberSent.getText()).toEqual('3');
            expect(homePage.numberDelivered.getText()).toEqual('3');
            expect(homePage.numberNotDelivered.getText()).toEqual('0');
        });
    });
});
