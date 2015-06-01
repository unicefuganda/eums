describe('Release Order Service', function () {

    var releaseOrderService,
        mockBackend,
        endpointUrl,
        mockPurchaseOrderService,
        mockSalesOrderService,
        scope,
        stubSalesOrder,
        fullPurchaseOrder,
        stubReleaseOrder,
        fullReleaseOrder,
        stubReleaseOrders,
        orderId = 1,
        programmeName = 'Test Programme';

    beforeEach(function () {
        module('ReleaseOrder');

        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['get']);
        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['get']);

        module(function ($provide) {
            $provide.value('PurchaseOrderService', mockPurchaseOrderService);
            $provide.value('SalesOrderService', mockSalesOrderService);
        });

        stubSalesOrder =  {
            id: 1,
            'programme': {
                id: 3,
                name: 'Alive'
            },
            'order_number': 10,
            'date': '2014-10-05',
            'salesorderitem_set': ['1']
        };

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
            salesOrder: 1,
            purchaseOrder: 1,
            releaseorderitemSet: [1, 2],
            programme: programmeName
        };

        fullReleaseOrder = stubReleaseOrder;
        fullReleaseOrder.purchase_order = fullPurchaseOrder;
        fullReleaseOrder.sales_order = stubSalesOrder;

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
            var deferredSalesOrderPromise = $q.defer();
            scope = $rootScope.$new();
            deferred.resolve(fullPurchaseOrder);
            deferredSalesOrderPromise.resolve(stubSalesOrder);
            mockPurchaseOrderService.get.and.returnValue(deferred.promise);
            mockSalesOrderService.get.and.returnValue(deferredSalesOrderPromise.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.RELEASE_ORDER;
            releaseOrderService = ReleaseOrderService;
        });
    });

    it('should get all release orders', function (done) {
        mockBackend.whenGET(endpointUrl).respond(stubReleaseOrders);

        releaseOrderService.all().then(function (orders) {
            expect(orders).toEqual(stubReleaseOrders);
            done();
        });
        mockBackend.flush();
    });

    it('should get release order by its id', function (done) {
        mockBackend.whenGET(endpointUrl + stubReleaseOrder.id).respond(fullReleaseOrder);

        releaseOrderService.get(stubReleaseOrder.id).then(function (releaseOrderDetails) {
            expect(releaseOrderDetails).toEqual(fullReleaseOrder);
            done();
        });
        mockBackend.flush();
    });
});
