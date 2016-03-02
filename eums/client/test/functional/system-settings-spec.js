'use strict';

var loginPage = require('./pages/login-page.js');
var systemSettingsPage = require('./pages/system-settings-page.js');

describe('SystemSettings', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        systemSettingsPage.visit();
    });

    it('should click switch button and cancel setting', function () {
        var currentStatus = systemSettingsPage.autoTrackStatus();
        systemSettingsPage.switch();
        systemSettingsPage.cancelAutoTrack();
        var canceledStatus = systemSettingsPage.autoTrackStatus();

        expect(currentStatus).toEqual(canceledStatus);
    });

    it('should click switch button and confirm setting', function () {
        var currentStatus = systemSettingsPage.autoTrackStatus();
        systemSettingsPage.switch();
        systemSettingsPage.confirmAutoTrack();
        var confirmedStatus = systemSettingsPage.autoTrackStatus();

        expect(currentStatus).toEqual(confirmedStatus);

        systemSettingsPage.visit();
        systemSettingsPage.switch();
        systemSettingsPage.confirmAutoTrack();
    });

    it('should not change country name by clicking cancel button', function () {
        var countryName = systemSettingsPage.countryName;
        systemSettingsPage.changeCountryName('somalia');
        systemSettingsPage.cancelChanges();
        var changedCountryName = systemSettingsPage.countryName;

        expect(countryName).toEqual(changedCountryName);
        expect(changedCountryName).not.toEqual('somalia');
    });

    it('should change country name by clicking save button', function () {
        var countryName = systemSettingsPage.countryName;
        systemSettingsPage.changeCountryName('somalia');
        systemSettingsPage.saveChanges();
        var changedCountryName = systemSettingsPage.countryName;

        expect(countryName).not.toEqual(changedCountryName);
        expect(changedCountryName).toEqual('somalia');
    });
});
