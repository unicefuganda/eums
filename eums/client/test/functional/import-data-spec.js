'use strict';

var feedbackReportPage = require('./pages/feedback-report-page.js');
var loginPage = require('./pages/login-page.js');
var importDataPage = require('./pages/import-data-page.js');

describe('Vision Data Imports', function () {

    it('should show consignees imported from vision on the feedback report page', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        importDataPage.visit();

        var path = require('path');
        var fileToUpload = './files/consignees.xlsx',
            absolutePath = path.resolve(__dirname, fileToUpload);

        element(by.css('#consigneesDiv input')).sendKeys(absolutePath);
        element(by.css('#consigneesDiv button')).click();

        var EC = protractor.ExpectedConditions;
        var successTick = element(by.css('#consigneesDiv .glyphicon.glyphicon-ok'));

        var uploadIsComplete = (EC.visibilityOf(successTick));
        browser.wait(uploadIsComplete, 15000, "Timeout exceeded while importing data");

        feedbackReportPage.visit();
        feedbackReportPage.consigneeSelect.click();

        expect(feedbackReportPage.consigneeResults).toContain('name of test consignee');
    });

    it('should show programmes imported from vision on the feedback report page', function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        importDataPage.visit();

        var path = require('path');
        var fileToUpload = './files/programs.xlsx',
            absolutePath = path.resolve(__dirname, fileToUpload);

        element(by.css('#programmesDiv input')).sendKeys(absolutePath);
        element(by.css('#programmesDiv button')).click();

        var EC = protractor.ExpectedConditions;
        var successTick = element(by.css('#programmesDiv .glyphicon.glyphicon-ok'));

        var uploadIsComplete = (EC.visibilityOf(successTick));
        browser.wait(uploadIsComplete, 15000, "Timeout exceeded while importing data");

        feedbackReportPage.visit();
        feedbackReportPage.programmeSelect.click();

        expect(feedbackReportPage.programmeResults).toContain('YI100 - PCR 3 Test Programme Name');
    });
});
