describe('Sales Order Service', function () {

    var mockProgrammeService, mockSalesOrderItemService, mockDeliveryNodeService, mockServiceFactory, config;

    beforeEach(function () {
        module('SalesOrder');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
            $provide.value('ProgrammeService', mockProgrammeService);
            $provide.value('SalesOrderItemService', mockSalesOrderItemService);
            $provide.value('DeliveryNodeService', mockDeliveryNodeService);
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
                distributionplannode_set: mockDeliveryNodeService
            }
        });
    });
});