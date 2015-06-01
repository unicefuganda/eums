describe('Release Order Item Service', function () {

    var releaseOrderItemService,
        mockBackend,
        endpointUrl,
        mockPurchaseOrderItemService,
        scope,
        releaseOrderItemId = 1,
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
        sales_order_item: stubSalesOrderItem,
        quantity: quantity,
        value: value
    };

    var stubReleaseOrderItem = {
        id: releaseOrderItemId,
        item_id: itemId,
        item_number: 10,
        purchase_order_item: purchaseOrderItemId,
        quantity: quantity,
        value: value
    };

    beforeEach(function () {
        module('ReleaseOrderItem');

        mockPurchaseOrderItemService = jasmine.createSpyObj('mockPurchaseOrderItemService', ['getPurchaseOrderItem']);

        module(function ($provide) {
            $provide.value('PurchaseOrderItemService', mockPurchaseOrderItemService);
        });

        inject(function (ReleaseOrderItemService, $httpBackend, EumsConfig, $q, $rootScope) {
            var deferred = $q.defer();
            scope = $rootScope.$new();
            deferred.resolve(stubPurchaseOrderItem);
            mockPurchaseOrderItemService.getPurchaseOrderItem.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM;
            releaseOrderItemService = ReleaseOrderItemService;
        });
    });

    it('should get release order item details', function (done) {
        var expectedReleaseOrderItem = {
            id: releaseOrderItemId,
            item_id: itemId,
            item_number: 10,
            purchase_order_item: stubPurchaseOrderItem,
            quantity: quantity,
            value: value
        };

        mockBackend.whenGET(endpointUrl + releaseOrderItemId + '/').respond(stubReleaseOrderItem);
        releaseOrderItemService.get(releaseOrderItemId).then(function (releaseOrderItem) {
            expect(releaseOrderItem).toEqual(expectedReleaseOrderItem);
            done();
        });
        mockBackend.flush();
    });
});
