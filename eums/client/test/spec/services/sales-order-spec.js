describe('Sales Order Service', function() {

    var salesOrderService, mockBackend, endpointUrl, mockProgrammeService, scope;
    var orderId = 1, programmeOneId = 1;

    var stubOrderOne = {
        order_number: orderId,
        date: '2014-10-06',
        description: 'Midwife Supplies',
        salesorderitem_set: [1, 2],
        programme: programmeOneId
    };

    var fullOrderOne = {
        order_number: stubOrderOne.order_number,
        date: stubOrderOne.date,
        description: stubOrderOne.description,
        salesorderitem_set: stubOrderOne.salesorderitem_set,
        programme: {
            id: programmeOneId,
            name: 'Test Programme',
            focalPerson: {
                id: 1,
                firstName: 'Musoke',
                lastName: 'Stephen'
            }
        }
    };
    var stubOrders = [
        {
            order_number: 1,
            date: '2014-10-06',
            description: 'Midwife Supplies',
            salesorderitem_set: [1, 2],
            programme: programmeOneId
        },
        {
            order_number: 2,
            date: '2014-10-06',
            description: 'Midwife Supplies',
            salesorderitem_set: [1, 2],
            programme: 2
        }
    ];

    beforeEach(function() {
        module('SalesOrder');

        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['getProgrammeDetails']);

        module(function($provide) {
            $provide.value('ProgrammeService', mockProgrammeService);
        });

        inject(function(SalesOrderService, $httpBackend, EumsConfig, $q, $rootScope) {
            var deferred = $q.defer();

            scope =  $rootScope.$new();
            deferred.resolve(fullOrderOne.programme);
            mockProgrammeService.getProgrammeDetails.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.SALES_ORDER;
            salesOrderService = SalesOrderService;
        });
    });

    it('should get all sales orders', function(done) {
        mockBackend.whenGET(endpointUrl).respond(stubOrders);

        salesOrderService.getSalesOrders().then(function(orders) {
            expect(orders).toEqual(stubOrders);
            done();
        });
        mockBackend.flush();
    });

    it('should get sales order details', function(done) {
        salesOrderService.getOrderDetails(stubOrderOne).then(function(detailedOrder) {
            expect(detailedOrder).toEqual(fullOrderOne);
            done();
        });
        scope.$apply();
    });
});
