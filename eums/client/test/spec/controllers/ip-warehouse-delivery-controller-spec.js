describe('IP Warehouse Delivery Controller', function () {
    var mockReleaseOrderService, mockUserService, location, scope, deferredReleaseOrders, deferredUser;
    var releaseOrders = [{order_number: 10}, {order_number: 2}, {order_number: 8}];
    var ipUser = {consignee_id: 1};
    var unicefUser = {consignee_id: null};
    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('IPWarehouseDelivery');
        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['forUser', 'all']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['getCurrentUser']);

        inject(function ($controller, $rootScope, $location, $q, $sorter) {
            deferredReleaseOrders = $q.defer();
            deferredUser = $q.defer();
            mockReleaseOrderService.all.and.returnValue(deferredReleaseOrders.promise);
            mockReleaseOrderService.forUser.and.returnValue(deferredReleaseOrders.promise);
            mockUserService.getCurrentUser.and.returnValue(deferredUser.promise);

            location = $location;
            scope = $rootScope.$new();

            spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('IPWarehouseDeliveryController', {
                $scope: scope,
                $sorter: $sorter,
                $location: location,
                ReleaseOrderService: mockReleaseOrderService,
                UserService: mockUserService
            });
        });
    });

    it('should fetch release orders for the logged in user and put them on the scope.', function () {
        deferredReleaseOrders.resolve(releaseOrders);
        deferredUser.resolve(ipUser);
        scope.initialize();
        scope.$apply();
        expect(mockReleaseOrderService.forUser).toHaveBeenCalledWith(ipUser);
        expect(scope.releaseOrders).toEqual(releaseOrders);
    });

    it('should set isIP to false when the logged in user is a unicef user.', function () {
        deferredUser.resolve(unicefUser);
        scope.initialize();
        scope.$apply();
        expect(scope.isIP).toEqual(false);
    });

    it('should set isIP to true when the logged in user is IP user.', function () {
        deferredUser.resolve(ipUser);
        scope.initialize();
        scope.$apply();
        expect(scope.isIP).toEqual(true);
    });

    it('should redirect to new report page when purchase order is selected', function () {
        scope.selectReleaseOrder({id: 10});
        scope.$apply();
        expect(location.path()).toBe('/ip-warehouse-delivery/new/10');
    });
});