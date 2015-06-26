describe('Release Order Item Service', function () {

    var releaseOrderItemService,
        mockBackend,
        endpointUrl,
        purchaseOrderItemEndpointUrl,
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
        salesOrderItem: stubSalesOrderItem,
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

        mockPurchaseOrderItemService = jasmine.createSpyObj('mockPurchaseOrderItemService', ['get']);

        module(function ($provide) {
            $provide.value('PurchaseOrderItemService', mockPurchaseOrderItemService);
        });

        inject(function (ReleaseOrderItemService, $httpBackend, EumsConfig, $q, $rootScope) {
            var deferred = $q.defer();
            scope = $rootScope.$new();
            deferred.resolve(stubPurchaseOrderItem);
            mockPurchaseOrderItemService.get.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM;
            purchaseOrderItemEndpointUrl = EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM;
            releaseOrderItemService = ReleaseOrderItemService;
        });
    });

    it('should get release order item details', function (done) {
        var expectedReleaseOrderItem = {
            id: releaseOrderItemId,
            itemId: itemId,
            itemNumber: 10,
            purchaseOrderItem: stubPurchaseOrderItem,
            quantity: quantity,
            value: value
        };

        mockBackend.whenGET(endpointUrl + releaseOrderItemId + '/').respond(stubReleaseOrderItem);
        mockBackend.whenGET(purchaseOrderItemEndpointUrl + stubPurchaseOrderItem.id + '/').respond(stubPurchaseOrderItem);
        releaseOrderItemService.get(releaseOrderItemId, ['purchase_order_item']).then(function (releaseOrderItem) {
            expect(releaseOrderItem).toEqual(expectedReleaseOrderItem);
            done();
        });
        mockBackend.flush();
    });
});
