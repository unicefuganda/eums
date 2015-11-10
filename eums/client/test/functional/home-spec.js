'use strict';

var loginPage = require('./pages/login-page.js');
var homePage = require('./pages/home-page.js');
var responsePage = require('./pages/response-page.js');
var endUserFeedbackPage = require('./pages/end-user-feedback-report-page.js');

describe('Home Page', function () {

    describe('Admin User', function () {

        beforeEach(function () {
            loginPage.visit();
            loginPage.loginAs('admin', 'admin');
        });

        it('should get global stats on map', function () {
            expect(homePage.mapLocation).toEqual('');
            expect(homePage.numberSent).toEqual('8 deliveries');
            expect(homePage.numberDelivered).toEqual('3 responses');
            expect(homePage.numberNotDelivered).toEqual('1 response');
            expect(homePage.numberNonResponse).toEqual('4 non-responses');
            expect(homePage.valueSent).toEqual('$212');
            expect(homePage.valueDelivered).toEqual('110');
            expect(homePage.valueNotDelivered).toEqual('20');
            expect(homePage.valueNonResponse).toEqual('82');
        });

        it('should click on kamapala district', function () {
            homePage.clickMapLayer('kampala');
            expect(homePage.mapLocation).toEqual('KAMPALA');
            expect(homePage.getMapZoomLevel()).toBe(12);
            expect(homePage.numberSent).toEqual('5 deliveries');
            expect(homePage.numberDelivered).toEqual('3 responses');
            expect(homePage.numberNotDelivered).toEqual('1 response');
            expect(homePage.numberNonResponse).toEqual('1 non-response');
            expect(homePage.valueSent).toEqual('$150');
            expect(homePage.valueDelivered).toEqual('110');
            expect(homePage.valueNotDelivered).toEqual('20');
            expect(homePage.valueNonResponse).toEqual('20');
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
            expect(homePage.getHighlightedStyle('wakiso')).toEqual({ fillColor: 'white', fillOpacity: 1, weight: 1.5 });
        });

        it('responses panel should have a link to more details', function () {
            homePage.clickMapLayer('wakiso');
            expect(homePage.responsesPageLink.getText()).toEqual('View District Responses');
        });

        it('should navigate to detail responses page when page link is clicked', function () {
            homePage.clickMapLayer('amuru');
            homePage.goToResponseDetailsPage();

            expect(endUserFeedbackPage.districtHeader.getText()).toEqual('Feedback Report from Deliveries to AMURU');
            expect(endUserFeedbackPage.resultsCount).toEqual(2);
            expect(endUserFeedbackPage.consignees).toContain('AMURU DHO');
            expect(endUserFeedbackPage.consignees).toContain('WAKISO DHO');
        });

        xit('should unzoom when the zoom out icon is clicked', function () {
            homePage.clickMapLayer('wakiso');
            homePage.clickZoomOutIcon();
            expect(homePage.getMapZoomLevel()).toBe(7.25);
            expect(homePage.numberSent).toEqual('$76,500.00');
            expect(homePage.numberDelivered).toEqual('$32,700.00');
            expect(homePage.numberNotDelivered).toEqual('57%');
        });
    });

    xdescribe('IP User', function () {
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
