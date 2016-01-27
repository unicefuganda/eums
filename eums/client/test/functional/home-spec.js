'use strict';

var loginPage = require('./pages/login-page.js');
var homePage = require('./pages/home-page.js');
var itemFeedbackPage = require('./pages/item-feedback-report-page.js');
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
                expect(homePage.numberSent).toEqual('8 deliveries');
                expect(homePage.numberDelivered).toEqual('4 responses');
                expect(homePage.numberNotDelivered).toEqual('1 response');
                expect(homePage.numberNonResponse).toEqual('3 non-responses');
                expect(homePage.valueSent).toEqual('$212');
                expect(homePage.valueDelivered).toEqual('122');
                expect(homePage.valueNotDelivered).toEqual('20');
                expect(homePage.valueNonResponse).toEqual('70');
            });

            it('should click on Kisoro district', function () {
                homePage.clickMapLayer('kisoro');
                expect(homePage.mapLocation).toEqual('KISORO');
                expect(homePage.getMapZoomLevel()).toBe(11);
                expect(homePage.numberSent).toEqual('3 deliveries');
                expect(homePage.numberDelivered).toEqual('3 responses');
                expect(homePage.numberNotDelivered).toEqual('0 responses');
                expect(homePage.numberNonResponse).toEqual('0 non-responses');
                expect(homePage.valueSent).toEqual('$110');
                expect(homePage.valueDelivered).toEqual('110');
                expect(homePage.valueNotDelivered).toEqual('0');
                expect(homePage.valueNonResponse).toEqual('0');
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
                    expect(responses[0].getText()).toEqual('A funny Item\n2 SENT NOT RECEIVED');
                });
                expect(homePage.responsesPageLink.getText()).toEqual('View District Responses');
            });

            it('should navigate to detail responses page when page link is clicked', function () {
                homePage.clickMapLayer('amuru');
                homePage.goToResponseDetailsPage();

                expect(itemFeedbackPage.districtSelect2.getAttribute('value')).toEqual('Amuru');
                expect(itemFeedbackPage.resultsCount).toEqual(10);
                expect(itemFeedbackPage.consignees).toContain('WAKISO DHO');
            });
        });

        describe('IP View', function () {

            beforeEach(function () {
                homePage.selectIpView();
            });

            it('should get global stats on map', function () {
                expect(homePage.mapLocation).toEqual('');
                expect(homePage.numberSent).toEqual('11 deliveries');
                expect(homePage.numberDelivered).toEqual('5 responses');
                expect(homePage.numberNotDelivered).toEqual('2 responses');
                expect(homePage.numberNonResponse).toEqual('3 non-responses');
                expect(homePage.valueSent).toEqual('$1.9k');
                expect(homePage.valueDelivered).toEqual('643');
                expect(homePage.valueNotDelivered).toEqual('230');
                expect(homePage.valueNonResponse).toEqual('262');
            });

            it('should click on bukomansimbi district', function () {
                homePage.clickMapLayer('bukomansimbi');
                expect(homePage.mapLocation).toEqual('BUKOMANSIMBI');
                expect(homePage.getMapZoomLevel()).toBe(11);
                expect(homePage.numberSent).toEqual('2 deliveries');
                expect(homePage.numberDelivered).toEqual('1 response');
                expect(homePage.numberNotDelivered).toEqual('0 responses');
                expect(homePage.numberNonResponse).toEqual('1 non-response');
                expect(homePage.valueSent).toEqual('$213');
                expect(homePage.valueDelivered).toEqual('151');
                expect(homePage.valueNotDelivered).toEqual('0');
                expect(homePage.valueNonResponse).toEqual('62');
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
                expect(homePage.getHighlightedStyle('wakiso')).toEqual({fillColor: 'map-received-with-issues', fillOpacity: 1, weight: 1.5});
            });

            it('responses panel should have a link to more details', function () {
                homePage.clickMapLayer('Amuru');
                expect(homePage.latestDeliveriesCount).toEqual(2);
                homePage.latestDeliveryResponses.then(function (responses) {
                    expect(responses[1].getText()).toEqual('Consignee 54 on 25-Sep-2014\nNOT RECEIVED');
                });
                expect(homePage.responsesPageLink.getText()).toEqual('View District Responses');
            });

            it('should navigate to detail responses page when page link is clicked', function () {
                homePage.clickMapLayer('amuru');
                homePage.goToResponseDetailsPage();

                expect(ipFeedbackReportByDeliveryPage.districtSelect2.getAttribute('value')).toEqual('Amuru');
                expect(itemFeedbackPage.resultsCount).toEqual(2);
                expect(itemFeedbackPage.consignees).toContain('RAKAI DHO');
                expect(itemFeedbackPage.consignees).toContain('KAABONG DHO');
            });
        });
    });

    describe('IP User', function () {
        beforeEach(function () {
            loginPage.visit();
            loginPage.loginAs('wakiso', 'wakiso');
        });

        it('should get global stats on map only for IP', function () {
            expect(homePage.mapLocation).toEqual('');
            expect(homePage.numberSent).toEqual('3 deliveries');
            expect(homePage.numberDelivered).toEqual('1 response');
            expect(homePage.numberNotDelivered).toEqual('0 responses');
            expect(homePage.numberNonResponse).toEqual('2 non-responses');
            expect(homePage.valueSent).toEqual('$62');
            expect(homePage.valueDelivered).toEqual('12');
            expect(homePage.valueNotDelivered).toEqual('0');
            expect(homePage.valueNonResponse).toEqual('50');
        });
    });
});
