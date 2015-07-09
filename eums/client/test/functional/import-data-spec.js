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
        directDeliveryPage.searchForThisPurchaseOrder('81020737');
        expect(directDeliveryPage.purchaseOrderCount).toEqual(1);

        directDeliveryPage.selectPurchaseOrderByNumber('81020737');
        directDeliveryPage.selectSingleIP();

        expect(directDeliveryPage.purchaseOrderItems).toContain('Acrylic glass scratch proof, 3mm');
        expect(directDeliveryPage.purchaseOrderItems).toContain('Cariage bolt M6x25 A2');

        expect(directDeliveryPage.purchaseOrderQuantities).toContain('8.00');
        expect(directDeliveryPage.purchaseOrderValues).toContain('$227.84');


        warehouseDeliveryPage.visit();
        expect(warehouseDeliveryPage.waybills).toContain('72082647');
        expect(warehouseDeliveryPage.waybills).toContain('72089797');
        expect(warehouseDeliveryPage.waybills).toContain('72088441');
        expect(warehouseDeliveryPage.waybills).toContain('72090975');
        expect(warehouseDeliveryPage.waybills).toContain('72102556');
        expect(warehouseDeliveryPage.waybills).toContain('72077697');
        expect(warehouseDeliveryPage.waybills).toContain('72095454');

        warehouseDeliveryPage.searchForThisWaybill('72095454');
        expect(warehouseDeliveryPage.waybillCount).toEqual(1);

        warehouseDeliveryPage.selectWaybillByNumber('72095454');
        expect(warehouseDeliveryPage.waybillItems).toContain('Computer, laptop');
        expect(warehouseDeliveryPage.waybillItems).toContain('Laptop bag');
        expect(warehouseDeliveryPage.waybillItems).toContain('IT Accessories');

        expect(warehouseDeliveryPage.waybillQuantities).toContain('3.00');
        expect(warehouseDeliveryPage.waybillValues).toContain('3091.26');
    });

    it('should show errors if the spreadsheets have missing required information', function () {

        importDataPage.uploadSalesOrders('../files/sales-errors.xlsx');
        expect(importDataPage.salesOrderErrorMessage()).toEqual(
            'Import has failed due to missing [order_number] in row [6]. Please correct the error then try the upload again'
        );

         importDataPage.uploadPurchaseOrders('../files/purchase-errors.xlsx');
        expect(importDataPage.purchaseOrderErrorMessage()).toEqual(
            'Import has failed due to missing [value] in row [4]. Please correct the error then try the upload again'
        );

        importDataPage.uploadReleaseOrders('../files/release-errors.xlsx');
        expect(importDataPage.releaseOrderErrorMessage()).toEqual(
            'Import has failed due to missing [ro_item_number] in row [4]. Please correct the error then try the upload again'
        );

        importDataPage.uploadConsignees('../files/consignees-errors.xlsx');
        expect(importDataPage.consigneeErrorMessage()).toEqual(
            'Import has failed due to missing [customer_id] in row [6]. Please correct the error then try the upload again'
        );

        importDataPage.uploadProgrammes('../files/programs-errors.xlsx');
        expect(importDataPage.programmeErrorMessage()).toEqual(
            'Import has failed due to missing [wbs_element_ex] in row [5]. Please correct the error then try the upload again'
        );
    });

    it('should update existing release orders with data from newly imported spreadsheets', function () {
        importDataPage.uploadReleaseOrders('../files/release-update.xlsx');

        warehouseDeliveryPage.visit();
        warehouseDeliveryPage.searchForThisWaybill('72095454');
        warehouseDeliveryPage.selectWaybillByNumber('72095454');

        expect(warehouseDeliveryPage.waybillQuantities).toContain('2.00');
        expect(warehouseDeliveryPage.waybillValues).toContain('4000.00');
        expect(warehouseDeliveryPage.waybillValues).toContain('200.00');
    });

    it('should update existing purchase orders with data from newly imported spreadsheets', function () {
        importDataPage.uploadPurchaseOrders('../files/purchase-update.xlsx');

        directDeliveryPage.visit();
        directDeliveryPage.searchForThisPurchaseOrder('81020737');
        expect(directDeliveryPage.purchaseOrderCount).toEqual(1);

        directDeliveryPage.selectPurchaseOrderByNumber('81020737');
        directDeliveryPage.selectSingleIP();

        expect(directDeliveryPage.purchaseOrderQuantities).toContain('999.00');
        expect(directDeliveryPage.purchaseOrderValues).toContain('$8,900.00');
    });

    it('should update existing outcomes with data from newly imported spreadsheets', function () {
        importDataPage.uploadProgrammes('../files/programs-update.xlsx');

        feedbackReportPage.visit();
        feedbackReportPage.programmeSelect.click();

        expect(feedbackReportPage.programmeResults).toContain('YI100 - PCR 3 Updated Test Programme Name');
    });

    // COMMENTING OUT THIS TEST PENDING FIX TO #96259738 WHERE CONSIGNEES ARE NOT BEING UPDATED
    xit('should update existing consignees with data from newly imported spreadsheets', function () {
        importDataPage.uploadConsignees('../files/consignees-update.xlsx');

        feedbackReportPage.visit();
        feedbackReportPage.consigneeSelect.click();

        expect(feedbackReportPage.consigneeResults).toContain('updated name of test consignee');
    });
});
