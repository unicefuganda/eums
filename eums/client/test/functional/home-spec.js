'use strict';

describe('Home Page', function () {
    var loginPage, homePage;


    beforeEach(function () {
        loginPage = require('./pages/login-page');
        homePage = loginPage.loginWithCredentials('admin', 'admin');

    });

    afterEach(function () {
        loginPage.logout();
    });

    it('should get global stats on map', function () {
        browser.sleep(5000);
        expect(homePage.mapLocation.getText()).toEqual('UNICEF Delivery Status for UGANDA');
        expect(homePage.numberSent.getText()).toEqual('11');
        expect(homePage.numberDelivered.getText()).toEqual('8');
        expect(homePage.numberNotDelivered.getText()).toEqual('3');
    });

    it('should click on wakiso district', function () {
        homePage.clickMapLayer('wakiso');
        browser.sleep(5000);
        expect(homePage.mapLocation.getText()).toEqual('UNICEF Delivery Status for WAKISO');
        expect(homePage.getMapZoomLevel()).toBe(10);
        expect(homePage.numberSent.getText()).toEqual('2');
        expect(homePage.numberDelivered.getText()).toEqual('1');
        expect(homePage.numberNotDelivered.getText()).toEqual('1');
    });

});
