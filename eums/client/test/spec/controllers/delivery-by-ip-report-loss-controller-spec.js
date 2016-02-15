'use strict';

describe('IP Delivery Report Loss Controller', function () {
    var scope, routeParams, q, toast, location, timeout, mockConsigneeItemService, mockDeliveryNodeService, ipNodes,
        mockLoaderService;

    var fetchedConsigneeItems = {
        results: [{
            id: 188,
            item: 88,
            itemDescription: 'some description',
            availableBalance: 25
        }]
    };
    var orderItemId = 6789;

    beforeEach(function () {
        module('DeliveryByIpReportLoss');

        ipNodes = [
            {id: 1, item: orderItemId, orderNumber: '12345678', balance: 10},
            {id: 2, item: orderItemId, orderNumber: '12345678', balance: 15},
            {id: 3, item: orderItemId, orderNumber: '98765432', balance: 5},
            {id: 4, item: orderItemId, orderNumber: '98765432', balance: 2}];

        inject(function ($controller, $rootScope, $location, $q, ngToast, $timeout) {
            scope = $rootScope.$new();
            toast = ngToast;
            timeout = $timeout;
            q = $q;
            location = $location;
            routeParams = {itemId: 88};

            mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'showModal', 'hideLoader']);
            mockConsigneeItemService = jasmine.createSpyObj('ConsigneeItemService', ['filter']);
            mockConsigneeItemService.filter.and.returnValue($q.when(fetchedConsigneeItems));
            mockDeliveryNodeService = jasmine.createSpyObj('mockDeliveryNodeService', ['filter', 'reportLoss']);
            mockDeliveryNodeService.filter.and.returnValue($q.when(ipNodes));
            mockDeliveryNodeService.reportLoss.and.returnValue($q.when());

            spyOn($location, 'path');
            spyOn(toast, 'create');

            $controller('DeliveryByIpReportLossController', {
                $scope: scope,
                ngToast: toast,
                $timeout: timeout,
                $routeParams: routeParams,
                LoaderService: mockLoaderService,
                ConsigneeItemService: mockConsigneeItemService,
                DeliveryNodeService: mockDeliveryNodeService
            });
        });
    });

    it('should show loader while loading', function () {
        scope.$apply();

        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.showLoader.calls.count()).toBe(1);
    });

    it('should call item service with correct route params and set on scope', function () {
        scope.$apply();
        expect(mockConsigneeItemService.filter).toHaveBeenCalledWith({item: routeParams.itemId});
        expect(scope.consigneeItem.itemId).toBe(88);
        expect(scope.consigneeItem.itemDescription).toBe('some description');
        expect(scope.consigneeItem.quantityAvailable).toBe(25);
    });

    it('should call delivery node service and set nodes on scope', function () {
        scope.$apply();
        var filterParams = {item__item: routeParams.itemId, is_distributable: true};
        expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith(filterParams);
        expect(scope.allDeliveries).toEqual(ipNodes);
        expect(scope.deliveryGroups.count()).toBe(2);
        expect(scope.deliveryGroups.first().orderNumber).toEqual('12345678');
        expect(scope.deliveryGroups.first().totalQuantity).toBe(25);
        expect(scope.deliveryGroups.first().numberOfShipments).toBe(2);
    });

    it('should select deliveries for the first PO or Waybill', function () {
        scope.$apply();

        expect(scope.selectedDeliveries.count()).toBe(2);
        expect(scope.selectedDeliveries.first().orderNumber).toEqual('12345678');
        expect(scope.selectedDeliveries[1].orderNumber).toEqual('12345678');
        expect(scope.selectedDeliveries.first().balance).toEqual(10);
        expect(scope.selectedDeliveries[1].balance).toEqual(15);
    });

    it('should hide the loader after loading the data', function () {
        scope.$apply();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader.calls.count()).toBe(1);
    });

    it('should change selected deliveries when selected order number is changed', function () {
        scope.$apply();
        scope.selectedOrderNumber = '98765432';
        scope.$apply();
        var selectedDeliveries = [
            {id: 3, item: orderItemId, orderNumber: '98765432', balance: 5},
            {id: 4, item: orderItemId, orderNumber: '98765432', balance: 2}
        ];
        expect(scope.selectedDeliveries).toEqual(selectedDeliveries);
    });

    it('should open delivery group when order number is the selected order number', function () {
        scope.$apply();
        scope.selectedOrderNumber = '98765432';
        expect(scope.deliveryGroups.first().isOpen()).toBeFalsy();
        expect(scope.deliveryGroups[1].isOpen()).toBeTruthy();
    });

    it('should change selected order number and selected deliveries', function () {
        scope.$apply();
        var orderNumber = '98765432';
        scope.updateSelectedOrderNumber(orderNumber);
        scope.$apply();
        expect(scope.selectedOrderNumber).toEqual(orderNumber);
    });

    it('should have no selected order number and deliveries, if updated/clicked twice', function () {
        scope.$apply();
        var orderNumber = '98765432';
        scope.updateSelectedOrderNumber(orderNumber);
        scope.$apply();
        scope.updateSelectedOrderNumber(orderNumber);
        scope.$apply();
        expect(scope.selectedOrderNumber).toBe(undefined);
        expect(scope.deliveryGroups.first().isOpen()).toBeFalsy();
        expect(scope.deliveryGroups[1].isOpen()).toBeFalsy();
    });

    it('should compute new delivery quantity from individual deliveries quantity selected', function () {
        scope.$apply();
        expect(scope.totalQuantitySelected).toBe(0);
        scope.selectedDeliveries.first().quantitySelected = 5;
        scope.$apply();
        expect(scope.totalQuantitySelected).toBe(5);

        scope.selectedDeliveries.last().quantitySelected = 7;
        scope.$apply();
        expect(scope.totalQuantitySelected).toBe(12);
    });

    it('should call the report loss service upon saving', function () {
        scope.$apply();
        var deliveryNodeOne = scope.selectedDeliveries.first();
        deliveryNodeOne.quantitySelected = 8;
        var deliveryNodeTwo = scope.selectedDeliveries.last();
        deliveryNodeTwo.quantitySelected = 4;
        scope.save();
        expect(mockDeliveryNodeService.reportLoss).toHaveBeenCalledWith([
            {id: deliveryNodeOne.id, quantity: 8},
            {id: deliveryNodeTwo.id, quantity: 4}
        ]);
    });

    it('should not include nodes without quantity selected in report loss service', function () {
        scope.$apply();
        var deliveryNodeOne = scope.selectedDeliveries.first();
        deliveryNodeOne.quantitySelected = 8;
        scope.save();
        expect(mockDeliveryNodeService.reportLoss).toHaveBeenCalledWith([
            {id: deliveryNodeOne.id, quantity: 8}
        ]);
    });

    it('should not include nodes with quantity selected of zero in report loss service', function () {
        scope.$apply();
        var deliveryNodeOne = scope.selectedDeliveries.first();
        deliveryNodeOne.quantitySelected = 8;
        var deliveryNodeTwo = scope.selectedDeliveries.last();
        deliveryNodeTwo.quantitySelected = 0;
        scope.save();
        expect(mockDeliveryNodeService.reportLoss).toHaveBeenCalledWith([
            {id: deliveryNodeOne.id, quantity: 8}
        ]);
    });

    it('should not report loss if all deliveries to IP have no or zero quantity selected', function () {
        scope.$apply();
        scope.selectedDeliveries = [{id: 1, item: orderItemId}, {id: 2, item: orderItemId, quantitySelected: 0}];
        scope.save();
        expect(mockDeliveryNodeService.reportLoss).not.toHaveBeenCalled();
    });

    it('should not save new delivery if any of the deliveries has a quantity shipped higher than their balance', function () {
        scope.$apply();
        scope.selectedDeliveries = [
            {id: 1, balance: 10, item: orderItemId, quantitySelected: 50},
            {id: 2, balance: 20, item: orderItemId, quantitySelected: 10}
        ];
        scope.save();
        expect(mockDeliveryNodeService.reportLoss).not.toHaveBeenCalled();
        expect(toast.create).toHaveBeenCalledWith({
            content: 'Cannot save. Please fill out or fix values', class: 'danger', maxNumber: 1, dismissOnTimeout: true
        });
    });


    it('should show success toast upon save', function () {
        scope.$apply();
        scope.selectedDeliveries.first().quantitySelected = 2;
        scope.save();
        scope.$apply();
        timeout.flush();
        expect(toast.create.calls.count()).toBe(1);
        expect(toast.create).toHaveBeenCalledWith({
            content: 'Loss/Damage Successfully Reported',
            class: 'success',
            maxNumber: 1,
            dismissOnTimeout: true
        });
    });

    it('should redirect to deliveries by ip list upon successful save', function () {
        scope.$apply();
        scope.selectedDeliveries.first().quantitySelected = 2;
        scope.save();
        scope.$apply();
        expect(location.path).toHaveBeenCalledWith('/ip-items')
    });

    it('should show failure toast when save fails', function () {
        scope.$apply();
        scope.selectedDeliveries.first().quantitySelected = 2;
        mockDeliveryNodeService.reportLoss.and.returnValue(q.reject());
        scope.save();
        scope.$apply();
        expect(toast.create).toHaveBeenCalledWith({
            content: 'Failed to Report Loss/Damage', class: 'danger', maxNumber: 1, dismissOnTimeout: true
        });
    });

    it('should fail to report loss if its quantities are from shipments with different order numbers but the same order type', function () {
        scope.$apply();
        scope.selectedDeliveries = [
            {id: 1, balance: 10, item: orderItemId, quantitySelected: 10, orderNumber: 444, orderType: 'waybill'},
            {id: 2, balance: 20, item: orderItemId, quantitySelected: 10, orderNumber: 555, orderType: 'waybill'}
        ];
        scope.save();
        expect(mockDeliveryNodeService.reportLoss).not.toHaveBeenCalled();
    });

    it('should fail to report loss if its quantities are from shipments with the same order numbers but different order types', function () {
        scope.$apply();
        scope.selectedDeliveries = [
            {id: 1, balance: 10, item: orderItemId, quantitySelected: 10, orderNumber: 444, orderType: 'waybill'},
            {id: 2, balance: 20, item: orderItemId, quantitySelected: 10, orderNumber: 444, orderType: 'purchase order'}
        ];
        scope.save();
        expect(mockDeliveryNodeService.reportLoss).not.toHaveBeenCalled();
    });

});