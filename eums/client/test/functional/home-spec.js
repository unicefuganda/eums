'use strict';

var loginPage = require('./pages/login-page.js');
var homePage = require('./pages/home-page.js');
var endUserFeedbackPage = require('./pages/end-user-feedback-report-page.js');
var ipFeedbackReportByDeliveryPage = require('./pages/ip-feedback-report-by-delivery-page.js');

describe('Home Page', function () {

    describe('Admin User', function () {

        beforeEach(function () {
            loginPage.visit();
            loginPage.loginAs('admin', 'admin');
        });

        describe('End User View', function () {

            it('should get global stats on map', function () {
                expect(homePage.mapLocation).toEqual('');
                expect(homePage.numberSent).toEqual('9 deliveries');
                expect(homePage.numberDelivered).toEqual('3 responses');
                expect(homePage.numberNotDelivered).toEqual('1 response');
                expect(homePage.numberNonResponse).toEqual('5 non-responses');
                expect(homePage.valueSent).toEqual('$311');
                expect(homePage.valueDelivered).toEqual('110');
                expect(homePage.valueNotDelivered).toEqual('20');
                expect(homePage.valueNonResponse).toEqual('181');
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
                expect(homePage.getHighlightedStyle('wakiso')).toEqual({fillColor: 'white', fillOpacity: 1, weight: 1.5});
            });

            it('responses panel should have labels on latest delivery responses', function () {
                homePage.clickMapLayer('kampala');
                expect(homePage.latestDeliveriesCount).toEqual(2);
                homePage.latestDeliveryResponses.then(function (responses) {
                    expect(responses[0].getText()).toEqual('Item 293\n2 SENT NOT RECEIVED');
                });
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
        });

        describe('IP View', function () {

            beforeEach(function () {
                homePage.selectIpView();
            });

            it('should get global stats on map', function () {
                expect(homePage.mapLocation).toEqual('');
                expect(homePage.numberSent).toEqual('10 deliveries');
                expect(homePage.numberDelivered).toEqual('5 responses');
                expect(homePage.numberNotDelivered).toEqual('1 response');
                expect(homePage.numberNonResponse).toEqual('3 non-responses');
                expect(homePage.valueSent).toEqual('$2.8k');
                expect(homePage.valueDelivered).toEqual('1.7k');
                expect(homePage.valueNotDelivered).toEqual('200');
                expect(homePage.valueNonResponse).toEqual('92');
            });

            it('should click on kamapala district', function () {
                homePage.clickMapLayer('wakiso');
                expect(homePage.mapLocation).toEqual('WAKISO');
                expect(homePage.getMapZoomLevel()).toBe(10);
                expect(homePage.numberSent).toEqual('3 deliveries');
                expect(homePage.numberDelivered).toEqual('2 responses');
                expect(homePage.numberNotDelivered).toEqual('0 responses');
                expect(homePage.numberNonResponse).toEqual('0 non-responses');
                expect(homePage.valueSent).toEqual('$2.0k');
                expect(homePage.valueDelivered).toEqual('1.2k');
                expect(homePage.valueNotDelivered).toEqual('0');
                expect(homePage.valueNonResponse).toEqual('0');
            });

            it('when I click on district number of responses should be 3 or less', function () {
                homePage.clickMapLayer('Amuru');
                homePage.numberOfResponses.then(function (rows) {
                    expect(rows.length).toBeLessThan(3);
                })
            });

            it('should highlight a layer', function () {
                homePage.highLightMapLayer('wakiso');
                expect(homePage.getHighlightedLayerName()).toEqual('wakiso');
                expect(homePage.getHighlightedStyle('wakiso')).toEqual({fillColor: 'map-received', fillOpacity: 1, weight: 1.5});
            });

            it('responses panel should have a link to more details', function () {
                homePage.clickMapLayer('wakiso');
                expect(homePage.latestDeliveriesCount).toEqual(4);
                homePage.latestDeliveryResponses.then(function (responses) {
                    expect(responses[2].getText()).toEqual('WAKISO DHO on 10-Oct-2021\nBAD CONDITION SATISFIED');
                    expect(responses[3].getText()).toEqual('WAKISO DHO on 10-Oct-2021\nGOOD SATISFIED');
                });
                expect(homePage.responsesPageLink.getText()).toEqual('View District Responses');
            });

            it('should navigate to detail responses page when page link is clicked', function () {
                homePage.clickMapLayer('amuru');
                homePage.goToResponseDetailsPage();

                expect(ipFeedbackReportByDeliveryPage.districtHeader.getText()).toEqual('Feedback Report from Deliveries to AMURU');
                expect(endUserFeedbackPage.resultsCount).toEqual(2);
                expect(endUserFeedbackPage.consignees).toContain('RAKAI DHO');
                expect(endUserFeedbackPage.consignees).toContain('KAABONG DHO');
            });

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
