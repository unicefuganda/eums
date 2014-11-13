describe('Sales Order Service', function () {

    var salesOrderService,
        mockBackend,
        endpointUrl,
        mockProgrammeService,
        scope,
        stubSalesOrder,
        fullSalesOrder,
        stubSalesOrders,
        orderId = 1,
        programmeOneId = 1;

    beforeEach(function () {
        module('SalesOrder');

        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['getProgrammeDetails']);

        module(function ($provide) {
            $provide.value('ProgrammeService', mockProgrammeService);
        });

        stubSalesOrder = {
            id: 1,
            order_number: orderId,
            date: '2014-10-06',
            description: 'Midwife Supplies',
            salesorderitem_set: [1, 2],
            programme: programmeOneId
        };
        fullSalesOrder = {
            id: stubSalesOrder.id,
            order_number: stubSalesOrder.order_number,
            date: stubSalesOrder.date,
            description: stubSalesOrder.description,
            salesorderitem_set: stubSalesOrder.salesorderitem_set,
            programme: {
                id: programmeOneId,
                name: 'Test Programme'
            }
        };
        stubSalesOrders = [
            stubSalesOrder,
            {
                order_number: 2,
                date: '2014-10-06',
                description: 'Midwife Supplies',
                salesorderitem_set: [1, 2],
                programme: 2
            }
        ];

        inject(function (SalesOrderService, $httpBackend, EumsConfig, $q, $rootScope) {
            var deferred = $q.defer();

            scope = $rootScope.$new();
            deferred.resolve(fullSalesOrder.programme);
            mockProgrammeService.getProgrammeDetails.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.SALES_ORDER;
            salesOrderService = SalesOrderService;
        });
    });

    it('should get all sales orders', function (done) {
        mockBackend.whenGET(endpointUrl).respond(stubSalesOrders);

        salesOrderService.getSalesOrders().then(function (orders) {
            expect(orders).toEqual(stubSalesOrders);
            done();
        });
        mockBackend.flush();
    });

    xit('should get sales order details', function (done) {
        salesOrderService.populateSalesOrderDetails(stubSalesOrder).then(function (detailedOrder) {
            expect(detailedOrder).toEqual(fullSalesOrder);
            done();
        });
        scope.$apply();
    });

    it('should get sales order by its id', function (done) {
        mockBackend.whenGET(endpointUrl + stubSalesOrder.id).respond(stubSalesOrder);
        salesOrderService.getSalesOrder(stubSalesOrder.id).then(function (salesOrderDetails) {
            expect(salesOrderDetails).toEqual(fullSalesOrder);
            done();
        });
        mockBackend.flush();
    });
});
