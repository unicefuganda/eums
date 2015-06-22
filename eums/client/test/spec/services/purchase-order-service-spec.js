describe('Purchase Order Service', function () {

    var mockSalesOrderService, mockPurchaseOrderItemService, mockServiceFactory, config;

    beforeEach(function () {
        module('PurchaseOrder');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
            $provide.value('SalesOrderService', mockSalesOrderService);
            $provide.value('PurchaseOrderItemService', mockPurchaseOrderItemService);
        });

        inject(function (PurchaseOrderService, EumsConfig) {
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
        });
    });

    it('should create itself with the right parameters', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.PURCHASE_ORDER,
            propertyServiceMap: {
                sales_order: mockSalesOrderService,
                purchaseorderitem_set: mockPurchaseOrderItemService
            },
            methods: jasmine.any(Object)
        });
    });
});

describe('Purchase Order Service when instantiated', function () {

    var purchaseOrderService, purchaseOrderEndpoint, mockBackend;

    beforeEach(function () {
        module('PurchaseOrder');

        inject(function (PurchaseOrderService, EumsConfig, $httpBackend) {
            mockBackend = $httpBackend;
            purchaseOrderService = PurchaseOrderService;
            purchaseOrderEndpoint = EumsConfig.BACKEND_URLS.PURCHASE_ORDER;
        });
    });

    it('should return purchase orders for direct deliveries', function (done) {
        mockBackend.whenGET(purchaseOrderEndpoint + 'for_direct_delivery/').respond([{id: 1}]);
        purchaseOrderService.forDirectDelivery().then(function (objects) {
            expect(objects).toEqual([{id: 1}]);
            done();
        });
        mockBackend.flush();
    });

    it('should return purchase orders for a user who is an IP', function (done) {
        var ipUser = {consignee_id: 10};
        mockBackend.whenGET(purchaseOrderEndpoint + '?consignee=10').respond([{id: 11}]);
        purchaseOrderService.forUser(ipUser).then(function (orders) {
            expect(orders).toEqual([{id: 11}]);
            done();
        });
        mockBackend.flush();
    });

    it('should return all purchase orders for a user who is not an IP', function (done) {
        var nonIpUser = {};
        mockBackend.whenGET(purchaseOrderEndpoint).respond([{id: 31}]);
        purchaseOrderService.forUser(nonIpUser).then(function (orders) {
            expect(orders).toEqual([{id: 31}]);
            done();
        });
        mockBackend.flush();
    });

    it('should convert object keys to camel case when returning purchase orders', function (done) {
        mockBackend.whenGET(purchaseOrderEndpoint + 'for_direct_delivery/').respond([{id: 1, release_orders: [1, 2]}]);
        purchaseOrderService.forDirectDelivery().then(function (objects) {
            expect(objects).toEqual([{id: 1, releaseOrders: [1, 2]}]);
            done();
        });
        mockBackend.flush();
    });
});
