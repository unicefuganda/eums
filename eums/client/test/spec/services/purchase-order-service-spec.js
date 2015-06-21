describe('Purchase Order Service', function () {

    var mockSalesOrderService, mockPurchaseOrderItemService, mockServiceFactory, config, mockProgrammeService;

    beforeEach(function () {
        module('PurchaseOrder');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
            $provide.value('SalesOrderService', mockSalesOrderService);
            $provide.value('PurchaseOrderItemService', mockPurchaseOrderItemService);
            $provide.value('ProgrammeService', mockProgrammeService);
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
                purchaseorderitem_set: mockPurchaseOrderItemService,
                programme: mockProgrammeService
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

    it('should convert object keys to camel case when returning purchase orders', function(done) {
        mockBackend.whenGET(purchaseOrderEndpoint + 'for_direct_delivery/').respond([{id: 1, release_orders: [1,2]}]);
        purchaseOrderService.forDirectDelivery().then(function (objects) {
            expect(objects).toEqual([{id: 1, releaseOrders: [1,2]}]);
            done();
        });
        mockBackend.flush();
    });
});
