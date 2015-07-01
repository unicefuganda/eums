'use strict';

var feedbackReportPage = require('./pages/feedback-report-page.js');
var loginPage = require('./pages/login-page.js');
var importDataPage = require('./pages/import-data-page.js');

describe('Vision Data Imports', function () {

    beforeEach(function(){
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');

        importDataPage.visit();
    });

    it('should show consignees imported from vision on the feedback report page', function () {

        importDataPage.uploadConsignees('../files/consignees.xlsx');

        feedbackReportPage.visit();
        feedbackReportPage.consigneeSelect.click();

        expect(feedbackReportPage.consigneeResults).toContain('name of test consignee');
    });

    it('should show programmes imported from vision on the feedback report page', function () {

        importDataPage.uploadProgrammes('../files/programs.xlsx');

        feedbackReportPage.visit();
        feedbackReportPage.programmeSelect.click();

        expect(feedbackReportPage.programmeResults).toContain('YI100 - PCR 3 Test Programme Name');
    });
});
