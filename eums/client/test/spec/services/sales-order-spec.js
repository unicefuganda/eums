describe('Sales Order Service', function () {

    var mockProgrammeService, mockSalesOrderItemService, mockDistributionPlanNodeService, mockServiceFactory, config;
    var mockBackend;
    var salesOrderEndpoint, salesOrderService;

    var stubSalesOrdersWithNoReleaseOrders = [{
        "id": 1,
        "order_number": 20143123,
        "date": "2014-01-01",
        "programme": 1,
        "description": "sample sales order",
        "salesorderitem_set": [
            1,
            2
        ],
        "release_orders": []
    }];

    var stubSalesOrdersWithReleaseOrders = [{
        "id": 1,
        "order_number": 20143123,
        "date": "2014-01-01",
        "programme": 1,
        "description": "sample sales order",
        "salesorderitem_set": [
            1,
            2
        ],
        "release_orders": [1,2,3]
    }];

    beforeEach(function () {
        module('SalesOrder');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
            $provide.value('ProgrammeService', mockProgrammeService);
            $provide.value('SalesOrderItemService', mockSalesOrderItemService);
            $provide.value('DistributionPlanNodeService', mockDistributionPlanNodeService);
        });

        inject(function (SalesOrderService, EumsConfig, $httpBackend) {
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
            mockBackend = $httpBackend;
            salesOrderEndpoint = EumsConfig.BACKEND_URLS.SALES_ORDER;
            salesOrderService = SalesOrderService;
        });

        mockBackend.whenGET(salesOrderEndpoint + '?has_release_orders=false').respond(stubSalesOrdersWithNoReleaseOrders);
        mockBackend.whenGET(salesOrderEndpoint + '?has_release_orders=true').respond(stubSalesOrdersWithReleaseOrders);
    });

    it('should create itself with the right parameters', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.SALES_ORDER,
            propertyServiceMap: {programme: mockProgrammeService, salesorderitem_set: mockSalesOrderItemService, distributionplannode_set: mockDistributionPlanNodeService}
        });
    });

    it('should return sales orders which do not have release orders ', function () {
        salesOrderService.getByHasReleaseOrders(false).then(function (objects) {
            expect(objects).toEqual(stubSalesOrdersWithNoReleaseOrders);
            done();
        });
        mockBackend.flush();
    });
});
