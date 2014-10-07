describe('Sales Order Service', function () {

    var salesOrderService, mockBackend, salesOrderEndpointUrl;
    var salesOrderId = 1;
    var anotherSalesOrderId = 2;

    var stubSalesOrder = {
        order_number: '1234',
        'date': '2014-10-06',
        'description': 'Midwife Supplies',
        'salesorderitem_set': [1, 2]
    };

    var anotherStubSalesOrder = {
        order_number: '2345',
        'date': '2014-10-10',
        'description': 'Printing Supplies',
        'salesorderitem_set': [3, 4]
    };

    var programme = {id: '1', name: 'Test Programme', salesorder_set: [salesOrderId, anotherSalesOrderId]};

    beforeEach(function () {
        module('SalesOrder');

        inject(function (SalesOrderService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            salesOrderEndpointUrl = EumsConfig.BACKEND_URLS.SALES_ORDER;
            salesOrderService = SalesOrderService;
        });
    });

    it('should get first sales order detail given the sales order id details', function (done) {
        mockBackend.whenGET(salesOrderEndpointUrl + salesOrderId + '/').respond(stubSalesOrder);
        mockBackend.whenGET(salesOrderEndpointUrl + anotherSalesOrderId + '/').respond(anotherStubSalesOrder);

        salesOrderService.getSalesOrder(programme.salesorder_set[0]).then(function (salesOrder) {
            expect(salesOrder).toEqual(stubSalesOrder);
            done();
        });
        mockBackend.flush();
    });

    it('should get another sales order detail given the sales order id details', function (done) {
        mockBackend.whenGET(salesOrderEndpointUrl + salesOrderId + '/').respond(stubSalesOrder);
        mockBackend.whenGET(salesOrderEndpointUrl + anotherSalesOrderId + '/').respond(anotherStubSalesOrder);

        salesOrderService.getSalesOrder(programme.salesorder_set[1]).then(function (salesOrder) {
            expect(salesOrder).toEqual(anotherStubSalesOrder);
            done();
        });
        mockBackend.flush();
    });
});
