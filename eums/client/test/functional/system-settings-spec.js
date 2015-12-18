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
});
