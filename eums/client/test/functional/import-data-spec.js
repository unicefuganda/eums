'use strict';

var feedbackReportPage = require('./pages/feedback-report-page.js');
var loginPage = require('./pages/login-page.js');
var importDataPage = require('./pages/import-data-page.js');

var directDeliveryPage = require('./pages/direct-delivery-page.js');
var warehouseDeliveryPage = require('./pages/warehouse-delivery-page.js');

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

    it('should show purchase orders and waybills imported from the spreadsheets', function () {

        importDataPage.uploadSalesOrders('../files/sales-orders.xlsx');
        importDataPage.uploadPurchaseOrders('../files/purchase-orders.xlsx');
        importDataPage.uploadReleaseOrders('../files/release-orders.xlsx');

        directDeliveryPage.visit();
        expect(directDeliveryPage.purchaseOrders).toContain('81020737');

        directDeliveryPage.searchForThisPurchaseOrder('81020737');
        expect(directDeliveryPage.purchaseOrderCount).toEqual(1);

        warehouseDeliveryPage.visit();
        expect(warehouseDeliveryPage.waybills).toContain('72082647');
        expect(warehouseDeliveryPage.waybills).toContain('72089797');
        expect(warehouseDeliveryPage.waybills).toContain('72088441');
        expect(warehouseDeliveryPage.waybills).toContain('72090975');
        expect(warehouseDeliveryPage.waybills).toContain('72102556');
        expect(warehouseDeliveryPage.waybills).toContain('72077697');

        warehouseDeliveryPage.searchForThisWaybill('72082647');
        expect(warehouseDeliveryPage.waybillCount).toEqual(1);
    });
});
