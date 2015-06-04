describe('Purchase Order Item Service', function () {

    var purchaseOrderItemService,
        endpointUrl,
        salesOrderItemService,
        mockServiceFactory;

    beforeEach(function () {
        module('PurchaseOrderItem');

        mockServiceFactory = jasmine.createSpyObj('mockFactoryService', ['create']);

        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
        });

        inject(function (PurchaseOrderItemService, EumsConfig, SalesOrderItemService) {
            purchaseOrderItemService = PurchaseOrderItemService;
            salesOrderItemService = SalesOrderItemService;
            endpointUrl = EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM;
        });
    });

    it('should invoke create on Factory Service with right params', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: endpointUrl,
            propertyServiceMap: {sales_order_item: salesOrderItemService}
        });
    });
});
