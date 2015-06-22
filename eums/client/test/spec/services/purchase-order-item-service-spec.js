describe('Purchase Order Item Service', function () {

    var purchaseOrderItemService,
        endpointUrl,
        distributionPlanNodeService,
        itemService,
        mockServiceFactory;

    beforeEach(function () {
        module('PurchaseOrderItem');

        mockServiceFactory = jasmine.createSpyObj('mockFactoryService', ['create']);

        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
        });

        inject(function (PurchaseOrderItemService, EumsConfig, DistributionPlanNodeService, ItemService) {
            purchaseOrderItemService = PurchaseOrderItemService;
            distributionPlanNodeService = DistributionPlanNodeService;
            itemService = ItemService;
            endpointUrl = EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM;
        });
    });

    it('should invoke create on Factory Service with right params', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: endpointUrl,
            propertyServiceMap: {distributionplannode_set: distributionPlanNodeService, item: itemService},
            methods: jasmine.any(Object)
        });
    });
});
