var ImportDataPage = function () {

    this.url = '/#/import-data';
    this.visit = function () {
        browser.get(this.url);
    };

    this.uploadConsignees = function(fileToUpload) {
        uploadUsingThisDiv('consigneesDiv', fileToUpload);
    };

    this.uploadProgrammes = function(fileToUpload) {
        uploadUsingThisDiv('programmesDiv', fileToUpload);
    };

    this.uploadPurchaseOrders = function(fileToUpload) {
        uploadUsingThisDiv('purchaseOrdersDiv', fileToUpload);
    };

    this.uploadReleaseOrders = function(fileToUpload) {
        uploadUsingThisDiv('releaseOrdersDiv', fileToUpload);
    };

    this.uploadSalesOrders = function(fileToUpload) {
        uploadUsingThisDiv('salesOrdersDiv', fileToUpload);
    };

    this.consigneeErrorMessage = function() { return getErrorMessage('consigneesDiv'); };
    this.programmeErrorMessage = function() { return getErrorMessage('programmesDiv'); };
    this.purchaseOrderErrorMessage = function() { return getErrorMessage('purchaseOrdersDiv'); };
    this.salesOrderErrorMessage = function() { return getErrorMessage('salesOrdersDiv'); };
    this.releaseOrderErrorMessage = function() { return getErrorMessage('releaseOrdersDiv'); };
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
    var errorCross = element(by.css('#' + itemDiv + ' .glyphicon.glyphicon-remove'));

    var uploadIsComplete = EC.or(EC.visibilityOf(successTick), EC.visibilityOf(errorCross));
    browser.wait(uploadIsComplete, 15000, "Timeout exceeded while importing data");
}

function getErrorMessage(divID) {
    return element(by.css('#' + divID + ' div div.text-danger.ng-binding')).getText()
}