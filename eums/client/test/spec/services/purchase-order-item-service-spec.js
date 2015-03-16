describe('Purchase Order Item Service', function () {

    var purchaseOrderItemService,
        mockBackend,
        endpointUrl,
        mockSalesOrderItemService,
        scope,
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
        sales_order: '1',
        item: stubItem,
        quantity: 100,
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        information: {
            distributionplanlineitem_set: []
        },
        distributionplanlineitem_set: []
    };

    var stubPurchaseOrderItem = {
        id: purchaseOrderItemId,
        item_number: itemId,
        sales_order_item: salesOrderItemId,
        quantity: quantity,
        value: value
    };

    beforeEach(function () {
        module('PurchaseOrderItem');

        mockSalesOrderItemService = jasmine.createSpyObj('mockSalesOrderItemService', ['getSalesOrderItem']);

        module(function ($provide) {
            $provide.value('SalesOrderItemService', mockSalesOrderItemService);
        });

        inject(function (PurchaseOrderItemService, $httpBackend, EumsConfig, $q, $rootScope) {
            var deferred = $q.defer();
            scope = $rootScope.$new();
            deferred.resolve(stubSalesOrderItem);
            mockSalesOrderItemService.getSalesOrderItem.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM;
            purchaseOrderItemService = PurchaseOrderItemService;
        });
    });

    it('should get purchase order item details', function (done) {
        var expectedPurchaseOrderItem = {
            id: purchaseOrderItemId,
            item_number: itemId,
            sales_order_item: stubSalesOrderItem,
            quantity: quantity,
            value: value
        };

        mockBackend.whenGET(endpointUrl + purchaseOrderItemId + '/').respond(stubPurchaseOrderItem);
        purchaseOrderItemService.getPurchaseOrderItem(purchaseOrderItemId).then(function (purchaseOrderItem) {
            expect(purchaseOrderItem).toEqual(expectedPurchaseOrderItem);
            done();
        });
        mockBackend.flush();
    });
});
