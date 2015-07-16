'use strict';

var loginPage = require('./pages/login-page.js');
var consigneesPage = require('./pages/consignees-page.js');

describe('Consignees and subconsignees', function () {

    beforeEach(function () {
        loginPage.visit();
        loginPage.loginAs('admin', 'admin');
        consigneesPage.visit();
    });

    it('should list consignees existing in the system', function () {
        consigneesPage.searchFor('Wakiso');

        expect(consigneesPage.consigneeCount).toEqual(1);
        expect(consigneesPage.consigneeNames).toContain('WAKISO DHO');
        expect(consigneesPage.consigneeIDs).toContain('L438000484');
    });

    it('should update consignees imported from vision', function () {
        consigneesPage.searchFor('Wakiso');
        expect(consigneesPage.consigneeRemarks).toContain('');

        consigneesPage.editConsignee();
        consigneesPage.setConsigneeRemarks('Updated Remarks');
        consigneesPage.saveConsignee();
        expect(consigneesPage.consigneeRemarks).toContain('Updated Remarks');
    });

    it('should add consignees to the list when their details are specified', function () {
        consigneesPage.addConsignee();
        consigneesPage.setConsigneeName('New Consignee');
        consigneesPage.setConsigneeLocation('New Consignee Location');
        consigneesPage.setConsigneeRemarks('New Consignee Remarks');
        consigneesPage.saveConsignee();

        consigneesPage.visit();
        consigneesPage.searchFor('New Consignee');
        expect(consigneesPage.consigneeNames).toContain('New Consignee');
        expect(consigneesPage.consigneeLocations).toContain('New Consignee Location');
        expect(consigneesPage.consigneeIDs).toContain('');
        expect(consigneesPage.consigneeRemarks).toContain('New Consignee Remarks');
    });

    it('should show which consignees are imported from vision', function () {
        consigneesPage.searchFor('New Consignee');
        expect(consigneesPage.consigneeTypeClass).toContain('ng-hide');

        consigneesPage.searchFor('WAKISO');
        expect(consigneesPage.consigneeTypeClass).not.toContain('ng-hide');
    });

    it('should be able to delete consignees not imported from vision', function () {
        consigneesPage.searchFor('New Consignee');
        consigneesPage.deleteConsignee();
        consigneesPage.confirmDeleteConsignee();

        consigneesPage.searchFor('New Consignee');
        expect(consigneesPage.consigneeCount).toEqual(0);
    });
});