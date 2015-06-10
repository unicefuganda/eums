describe('Sales Order Service', function () {

    var mockProgrammeService, mockSalesOrderItemService, mockDistributionPlanNodeService, mockServiceFactory, config;

    beforeEach(function () {
        module('SalesOrder');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
            $provide.value('ProgrammeService', mockProgrammeService);
            $provide.value('SalesOrderItemService', mockSalesOrderItemService);
            $provide.value('DistributionPlanNodeService', mockDistributionPlanNodeService);
        });

        inject(function (SalesOrderService, EumsConfig) {
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
        });
    });

    it('should create itself with the right parameters', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.SALES_ORDER,
            propertyServiceMap: {
                programme: mockProgrammeService,
                salesorderitem_set: mockSalesOrderItemService,
                distributionplannode_set: mockDistributionPlanNodeService
            },
            methods: jasmine.any(Object)
        });
    });
});

describe('Sales Order Service when instantiated', function () {

    var salesOrderService, salesOrderEndpoint, mockBackend;

    beforeEach(function () {
        module('SalesOrder');

        inject(function (SalesOrderService, EumsConfig, $httpBackend) {
            mockBackend = $httpBackend;
            salesOrderService = SalesOrderService;
            salesOrderEndpoint = EumsConfig.BACKEND_URLS.SALES_ORDER;
        });
    });

    it('should return sales orders for warehouse delivery', function (done) {
        mockBackend.whenGET(salesOrderEndpoint + '?has_release_orders=false').respond([{id: 1}]);
        salesOrderService.forWarehouseDelivery().then(function (objects) {
            expect(objects).toEqual([{id: 1}]);
            done();
        });
        mockBackend.flush();
    });

    it('should return sales orders for direct deliveries', function (done) {
        mockBackend.whenGET(salesOrderEndpoint + '?has_release_orders=true').respond([{id: 1, release_orders: [1,2]}]);
        salesOrderService.forDirectDelivery().then(function (objects) {
            expect(objects).toEqual([{id: 1, releaseOrders: [1,2]}]);
            done();
        });
        mockBackend.flush();
    });

    it('should convert object keys to camel case when filtering sales orders', function(done) {
        mockBackend.whenGET(salesOrderEndpoint + '?has_release_orders=true').respond([{id: 1, release_orders: [1,2]}]);
        salesOrderService.forDirectDelivery().then(function (objects) {
            expect(objects).toEqual([{id: 1, releaseOrders: [1,2]}]);
            done();
        });
        mockBackend.flush();
    });
});
