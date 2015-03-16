describe('Release Order Service', function () {

    var releaseOrderService,
        mockBackend,
        endpointUrl,
        mockPurchaseOrderService,
        scope,
        fullPurchaseOrder,
        stubReleaseOrder,
        fullReleaseOrder,
        stubReleaseOrders,
        orderId = 1,
        programmeName = 'Test Programme';

    beforeEach(function () {
        module('ReleaseOrder');

        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['getPurchaseOrder']);

        module(function ($provide) {
            $provide.value('PurchaseOrderService', mockPurchaseOrderService);
        });

        fullPurchaseOrder = {
            id: 1,
            order_number: orderId,
            sales_order: {
                id: 1,
                order_number: orderId,
                date: '2014-10-06',
                description: 'Midwife Supplies',
                salesorderitem_set: [1, 2],
                programme: {
                    id: 1,
                    name: 'test'
                }
            },
            date: '2014-10-06',
            purchaseorderitem_set: [1, 2],
            programme: programmeName
        };

        stubReleaseOrder = {
            id: 1,
            order_number: orderId,
            delivery_date: '2014-10-06',
            description: 'Midwife Supplies',
            consignee: 1,
            waybill: 1,
            sales_order: 1,
            purchase_order: 1,
            releaseorderitem_set: [1, 2],
            programme: programmeName
        };

        fullReleaseOrder = stubReleaseOrder;
        fullReleaseOrder.purchase_order = fullPurchaseOrder;

        stubReleaseOrders = [
            stubReleaseOrder,
            {
                id: 2,
                order_number: 2,
                delivery_date: '2014-09-20',
                description: 'Books',
                consignee: 2,
                waybill: 2,
                sales_order: 2,
                releaseorderitem_set: [3, 4],
                programme: programmeName
            }
        ];

        inject(function (ReleaseOrderService, $httpBackend, EumsConfig, $q, $rootScope) {
            var deferred = $q.defer();
            scope = $rootScope.$new();
            deferred.resolve(fullPurchaseOrder);
            mockPurchaseOrderService.getPurchaseOrder.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.RELEASE_ORDER;
            releaseOrderService = ReleaseOrderService;
        });
    });

    it('should get all release orders', function (done) {
        mockBackend.whenGET(endpointUrl).respond(stubReleaseOrders);

        releaseOrderService.getReleaseOrders().then(function (orders) {
            expect(orders).toEqual(stubReleaseOrders);
            done();
        });
        mockBackend.flush();
    });

    it('should get release order by its id', function (done) {
        mockBackend.whenGET(endpointUrl + stubReleaseOrder.id).respond(fullReleaseOrder);

        releaseOrderService.getReleaseOrder(stubReleaseOrder.id).then(function (releaseOrderDetails) {
            expect(releaseOrderDetails).toEqual(fullReleaseOrder);
            done();
        });
        mockBackend.flush();
    });
});
