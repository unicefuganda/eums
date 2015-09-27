describe('DirectDeliveryIpChoiceController', function () {

    var scope, location, routeParams, q;
    var mockPurchaseOrderService, mockLoaderService, deferredPurchaseOrder;

    beforeEach(function () {
        module('DirectDeliveryIpChoice');

        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['get']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader']);

        inject(function ($controller, $rootScope, $q, $location) {

            q = $q
            deferredPurchaseOrder = $q.defer();
            mockPurchaseOrderService.get.and.returnValue(deferredPurchaseOrder.promise);

            location = $location;
            scope = $rootScope.$new();

            $controller('DirectDeliveryIpChoiceController', {
                $scope: scope,
                $q: q,
                $location: location,
                $routeParams: {purchaseOrderId: 5},
                PurchaseOrderService: mockPurchaseOrderService,
                LoaderService: mockLoaderService
            });
        });        
    });

    it('should set the selected purchase order to result of service call', function () {
        deferredPurchaseOrder.resolve('some purchase order')
        scope.$apply();
        expect(mockPurchaseOrderService.get).toHaveBeenCalledWith(5);
        expect(scope.selectedPurchaseOrder).toBe('some purchase order');
    });

    it('should set location to single ip when purchase order has been set to single ip', function () {
        deferredPurchaseOrder.resolve({isSingleIp: true});
        scope.$apply();
        expect(location.path()).toMatch('single');
    });

    it('should set location to multiple ip when purchase order has been set to single ip', function () {
        deferredPurchaseOrder.resolve({isSingleIp: false});
        scope.$apply();
        expect(location.path()).toMatch('multiple');
    });    

    it('should route to single ip when single ip is selected', function () {
        scope.selectedPurchaseOrder = {id: 5};
        scope.showSingleIpMode();
        scope.$apply();
        expect(location.path()).toBe('/direct-delivery/new/5/single');
    });

    it('should route to multiple ip when multiple ip is selected', function () {
        scope.selectedPurchaseOrder = {id: 5};
        scope.showMultipleIpMode();
        scope.$apply();
        expect(location.path()).toBe('/direct-delivery/new/5/multiple');
    });

    it('should start spinner on load', function () {
        scope.$apply();
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).not.toHaveBeenCalled();
    });

    it('should hide spinner after service call', function () {
        deferredPurchaseOrder.resolve('some purchase order');
        scope.$apply();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });
});