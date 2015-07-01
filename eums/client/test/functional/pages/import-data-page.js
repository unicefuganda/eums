var ImportDataPage = function () {

    this.url = '#/import-data';
    this.visit = function () {
        browser.get(this.url);
    };

    this.uploadConsignees = function(fileToUpload) {
        uploadUsingThisDiv('consigneesDiv', fileToUpload);
    };

    this.uploadProgrammes = function(fileToUpload) {
        uploadUsingThisDiv('programmesDiv', fileToUpload);
    };
};

module.exports = new ImportDataPage;


function uploadUsingThisDiv (divID, fileToUpload) {
    itemDiv = divID;

    var path = require('path');
    absolutePath = path.resolve(__dirname, fileToUpload);

    element(by.css('#' + itemDiv + ' input')).sendKeys(absolutePath);
    element(by.css('#' + itemDiv + ' button')).click();

    var EC = protractor.ExpectedConditions;
    var successTick = element(by.css('#' + itemDiv + ' .glyphicon.glyphicon-ok'));

    var uploadIsComplete = (EC.visibilityOf(successTick));
    browser.wait(uploadIsComplete, 15000, "Timeout exceeded while importing data");
}
