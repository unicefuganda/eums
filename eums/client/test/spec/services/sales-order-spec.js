describe('Sales Order Service', function() {

    var salesOrderService, mockBackend, endpointUrl, programmeEndpointUrl;
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
            focal_person: {
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

        inject(function(SalesOrderService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.SALES_ORDER;
            programmeEndpointUrl = EumsConfig.BACKEND_URLS.PROGRAMME;
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
        mockBackend.whenGET(programmeEndpointUrl + programmeOneId + '/').respond(fullOrderOne.programme);
        salesOrderService.getOrderDetails(stubOrderOne).then(function(detailedOrder) {
            expect(detailedOrder).toEqual(fullOrderOne);
            done();
        });
        mockBackend.flush();
    });
});
