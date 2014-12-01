describe('Purchase Order Service', function () {

    var purchaseOrderService,
        mockBackend,
        endpointUrl,
        mockSalesOrderService,
        scope,
        stubSalesOrder,
        stubPurchaseOrder,
        fullPurchaseOrder,
        stubPurchaseOrders,
        orderId = 1,
        salesOrderOneId = 1;

    beforeEach(function () {
        module('PurchaseOrder');

        mockSalesOrderService = jasmine.createSpyObj('mockSalesOrderService', ['getSalesOrder']);

        module(function ($provide) {
            $provide.value('SalesOrderService', mockSalesOrderService);
        });

        stubSalesOrder = {
            id: 1,
            order_number: orderId,
            date: '2014-10-06',
            description: 'Midwife Supplies',
            salesorderitem_set: [1, 2],
            programme: {
                id: 1,
                name: 'Test Programme'
            }
        };

        stubPurchaseOrder = {
            id: 1,
            order_number: orderId,
            sales_order: salesOrderOneId,
            date: '2014-10-06',
            purchaseorderitem_set: [1, 2]
        };

        fullPurchaseOrder = {
            id: stubPurchaseOrder.id,
            order_number: stubPurchaseOrder.order_number,
            date: stubPurchaseOrder.date,
            purchaseorderitem_set: stubPurchaseOrder.purchaseorderitem_set,
            sales_order: stubSalesOrder
        };

        stubPurchaseOrders = [
            stubPurchaseOrder,
            {
                id: 1,
                order_number: 2,
                sales_order: 2,
                date: '2014-10-06',
                purchaseorderitem_set: [3, 4]
            }
        ];

        inject(function (PurchaseOrderService, $httpBackend, EumsConfig, $q, $rootScope) {
            var deferred = $q.defer();
            scope = $rootScope.$new();
            deferred.resolve(fullPurchaseOrder.sales_order);
            mockSalesOrderService.getSalesOrder.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.PURCHASE_ORDER;
            purchaseOrderService = PurchaseOrderService;
        });
    });

    it('should get all purchase orders', function (done) {
        mockBackend.whenGET(endpointUrl).respond(stubPurchaseOrders);

        purchaseOrderService.getPurchaseOrders().then(function (orders) {
            expect(orders).toEqual(stubPurchaseOrders);
            done();
        });
        mockBackend.flush();
    });

    it('should get purchase order by its id', function (done) {
        mockBackend.whenGET(endpointUrl + stubPurchaseOrder.id).respond(stubPurchaseOrder);
        purchaseOrderService.getPurchaseOrder(stubPurchaseOrder.id).then(function (purchaseOrderDetails) {
            expect(purchaseOrderDetails).toEqual(fullPurchaseOrder);
            done();
        });
        mockBackend.flush();
    });
});
