describe('IP Direct delivery Controller', function () {
    var mockPurchaseOrderService, mockUserService, location, scope, deferredPurchaseOrders, deferredUser;
    var purchaseOrders = [{order_number: 10, hasPlan:true}, {order_number: 2, hasPlan:true}, {order_number: 8}];
    var user = {consignee_id: 1};
    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('IPDirectDelivery');
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['forUser', 'all']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['getCurrentUser']);

        inject(function ($controller, $rootScope, $location, $q, $sorter) {
            deferredPurchaseOrders = $q.defer();
            deferredUser = $q.defer();
            mockPurchaseOrderService.all.and.returnValue(deferredPurchaseOrders.promise);
            mockPurchaseOrderService.forUser.and.returnValue(deferredPurchaseOrders.promise);
            mockUserService.getCurrentUser.and.returnValue(deferredUser.promise);

            location = $location;
            scope = $rootScope.$new();

            spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('IPDirectDeliveryController', {
                $scope: scope,
                $sorter: $sorter,
                $location: location,
                PurchaseOrderService: mockPurchaseOrderService,
                UserService: mockUserService
            });
        });
    });

    it('should fetch purchase orders for the logged in user and put them on the scope.', function () {
        deferredPurchaseOrders.resolve(purchaseOrders);
        deferredUser.resolve(user);
        scope.initialize();
        scope.$apply();
        var expectedPurchaseOrders = [{order_number: 10, hasPlan:true}, {order_number: 2, hasPlan:true}]
        expect(mockPurchaseOrderService.forUser).toHaveBeenCalledWith(user);
        expect(scope.purchaseOrders).toEqual(expectedPurchaseOrders);
    });

    it('should redirect to new report page when purchase order is selected', function () {
        scope.selectPurchaseOrder({id: 10});
        scope.$apply();
        expect(location.path()).toBe('/ip-delivery-report/new/10');
    });
});