'use strict';

var loginPage = require('./pages/login-page.js');
var homePage = require('./pages/home-page.js');
var responsePage = require('./pages/response-page.js');

describe('Home Page', function () {

    describe('Admin User', function () {

        beforeEach(function () {
            loginPage.visit();
            loginPage.loginAs('admin', 'admin');
        });

        it('should get global stats on map', function () {
            expect(homePage.mapLocation).toEqual('');
            expect(homePage.numberSent).toEqual('$76,500.00');
            expect(homePage.numberDelivered).toEqual('$32,700.00');
            expect(homePage.numberNotDelivered).toEqual('57%');
        });

        it('should click on wakiso district', function () {
            homePage.clickMapLayer('wakiso');
            expect(homePage.mapLocation).toEqual('WAKISO');
            expect(homePage.getMapZoomLevel()).toBe(10);
            expect(homePage.numberSent).toEqual('$1,200.00');
            expect(homePage.numberDelivered).toEqual('$1,200.00');
            expect(homePage.numberNotDelivered).toEqual('0%');
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
            expect(homePage.responsesPageLink.getText()).toEqual('View District Responses');
        });

        it('should navigate to detail responses page when page link is clicked', function () {
            homePage.clickMapLayer('wakiso');
            homePage.goToResponseDetailsPage();

            expect(responsePage.header.getText()).toEqual('All responses for WAKISO district');
            responsePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toEqual(3);
            })
        });

        it('should search for "no" product received in Wakiso district', function () {
            homePage.clickMapLayer('wakiso');
            homePage.goToResponseDetailsPage();
            responsePage.searchResponsesFor('no');
            responsePage.numberOfResponses.then(function (rows) {
                expect(rows.length).toEqual(0);
            })
        });

        it('should search for "yes" product received in Wakiso district', function () {
            var expectedItems = ['IEHK2006,kit,suppl.1-drugs', 'Safety box f.used syrgs/ndls 5lt/BOX-25'];
            homePage.clickMapLayer('wakiso');
            homePage.goToResponseDetailsPage();
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

        it('should unzoom when the zoom out icon is clicked', function () {
            homePage.clickMapLayer('wakiso');
            homePage.clickZoomOutIcon();
            expect(homePage.getMapZoomLevel()).toBe(7);
            expect(homePage.numberSent).toEqual('$76,500.00');
            expect(homePage.numberDelivered).toEqual('$32,700.00');
            expect(homePage.numberNotDelivered).toEqual('57%');
        });
    });

    describe('IP User', function () {
        beforeEach(function () {
            loginPage.visit();
            loginPage.loginAs('wakiso', 'wakiso');
        });

        it('should get global stats on map only for IP', function () {
            expect(homePage.mapLocation).toEqual('');
            expect(homePage.numberSent).toEqual('$1,200.00');
            expect(homePage.numberDelivered).toEqual('$1,200.00');
            expect(homePage.numberNotDelivered).toEqual('0%');
        });
    });
});
