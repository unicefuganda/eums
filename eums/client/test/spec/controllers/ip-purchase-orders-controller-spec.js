describe('IP Purchase Orders Controller', function () {
    var mockPurchaseOrderService, mockUserService, location, scope, deferredPurchaseOrders, deferredUser;
    var allPurchaseOrders = [{order_number: 10}, {order_number: 2}, {order_number: 8}];
    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('ReportedByIP');
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['getConsigneePurchaseOrders', 'all']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['getCurrentUser']);

        inject(function ($controller, $rootScope, $location, $q, $sorter) {
            deferredPurchaseOrders = $q.defer();
            deferredUser = $q.defer();
            mockPurchaseOrderService.all.and.returnValue(deferredPurchaseOrders.promise);
            mockPurchaseOrderService.getConsigneePurchaseOrders.and.returnValue(deferredPurchaseOrders.promise);
            mockUserService.getCurrentUser.and.returnValue(deferredUser.promise);

            location = $location;
            scope = $rootScope.$new();

            spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('IPPurchaseOrdersController', {
                $scope: scope,
                $sorter: $sorter,
                $location: location,
                PurchaseOrderService: mockPurchaseOrderService,
                UserService: mockUserService
            });
        });
    });

    describe('when current user is not an IP', function () {
        var nonIPUser = {};

        it('should fetch all purchase orders and put them on scope', function () {
            deferredPurchaseOrders.resolve(allPurchaseOrders);
            deferredUser.resolve(nonIPUser);
            scope.initialize();
            scope.$apply();
            expect(mockPurchaseOrderService.all).toHaveBeenCalledWith(['programme']);
            expect(scope.purchaseOrders).toEqual(allPurchaseOrders);
        });
    });

    describe('when current user is an IP', function () {
        var ipUser = {consignee_id: 1};
        var ipPurchaseOrders = [allPurchaseOrders[0]];

        it('should fetch purchase orders with which the IP is involved and put them on the scope.', function () {
            deferredPurchaseOrders.resolve(ipPurchaseOrders);
            deferredUser.resolve(ipUser);
            scope.initialize();
            scope.$apply();
            expect(mockPurchaseOrderService.getConsigneePurchaseOrders).toHaveBeenCalledWith(ipUser.consignee_id);
            expect(scope.purchaseOrders).toEqual(ipPurchaseOrders);
        });
    });
});