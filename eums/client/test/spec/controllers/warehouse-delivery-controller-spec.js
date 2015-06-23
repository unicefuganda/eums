describe('Warehouse Delivery Controller', function () {
    var scope, mockReleaseOrderService, location, deferredReleaseOrders;
    var releaseOrders = [{id: 1}, {id: 2}];

    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('WarehouseDelivery');

        mockReleaseOrderService = jasmine.createSpyObj("mockReleaseOrderService", ["all"]);
        inject(function ($controller, $rootScope, $location, $q, $sorter) {
            deferredReleaseOrders = $q.defer();
            mockReleaseOrderService.all.and.returnValue(deferredReleaseOrders.promise);
            scope = $rootScope.$new();
            location = $location;

            spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('WarehouseDeliveryController', {
                $scope: scope,
                $sorter: $sorter,
                $location: location,
                ReleaseOrderService: mockReleaseOrderService
            });
        });
    });

    it('should fetch release orders and put them on the scope.', function () {
        deferredReleaseOrders.resolve(releaseOrders);
        scope.initialize();
        scope.$apply();
        expect(mockReleaseOrderService.all).toHaveBeenCalled();
        expect(scope.releaseOrders).toEqual(releaseOrders);
    });

    it('should redirect to new warehouse delivery page when release order is selected', function () {
        var id = 39;
        scope.selectReleaseOrder(id);
        scope.$apply();
        expect(location.path()).toBe('warehouse-delivery/new/' + id);
    });
});