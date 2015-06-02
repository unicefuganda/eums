describe('Purchase Order Item Service', function () {

    var purchaseOrderItemService,
        mockBackend, q,
        endpointUrl,
        mockSalesOrderItemService,
        purchaseOrderItemId = 1,
        salesOrderItemId = 1,
        itemId = 1,
        quantity = 100,
        value = 1000.00;

    var stubItem = {
        id: itemId,
        description: 'item description',
        unit: 1
    };

    var stubSalesOrderItem = {
        id: salesOrderItemId,
        salesOrder: '1',
        item: stubItem,
        quantity: 100,
        netPrice: 10.00,
        netValue: 1000.00,
        issueDate: '2014-10-02',
        deliveryDate: '2014-10-02',
        information: {
            distributionplanlineitemSet: []
        },
        distributionplanlineitemSet: []
    };

    var stubPurchaseOrderItem = {
        id: purchaseOrderItemId,
        itemNumber: itemId,
        sales_order_item: salesOrderItemId,
        quantity: quantity,
        value: value
    };

    beforeEach(function () {
        module('PurchaseOrderItem');

        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['get']);

        module(function ($provide) {
            $provide.value('SalesOrderItemService', mockSalesOrderItemService);
        });

        inject(function (PurchaseOrderItemService, $httpBackend, EumsConfig, $q) {
            q = $q;
            var deferredSalesOrderItemRequest = q.defer();
            deferredSalesOrderItemRequest.resolve(stubSalesOrderItem);
            mockSalesOrderItemService.get.and.returnValue(deferredSalesOrderItemRequest.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM;
            purchaseOrderItemService = PurchaseOrderItemService;
        });
    });

    it('should get purchase order item details', function (done) {
        var expectedPurchaseOrderItem = {
            id: purchaseOrderItemId,
            itemNumber: itemId,
            salesOrderItem: stubSalesOrderItem,
            quantity: quantity,
            value: value
        };

        mockBackend.whenGET(endpointUrl + purchaseOrderItemId + '/').respond(stubPurchaseOrderItem);
        purchaseOrderItemService.get(purchaseOrderItemId, ['sales_order_item']).then(function (purchaseOrderItem) {
            expect(purchaseOrderItem).toEqual(expectedPurchaseOrderItem);
            done();
        });
        mockBackend.flush();
    });
});
