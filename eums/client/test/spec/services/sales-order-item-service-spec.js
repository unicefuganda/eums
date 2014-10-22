describe('Sales Order Item Service', function () {

    var salesOrderItemService, mockBackend, salesOrderItemEndpointUrl, itemEndpointUrl, itemUnitEndpointUrl;
    var salesOrderItemId = 1;
    var itemId = 1;
    var itemUnitId = 1;

    var stubSalesOrderItem = {
        id: salesOrderItemId,
        sales_order: '1',
        item: itemId,
        quantity: 100,
        net_price: 10.00,
        net_value: 1000.00,
        issue_date: '2014-10-02',
        delivery_date: '2014-10-02',
        distributionplanlineitem_set: []
    };

    var stubItem = {
        id: itemId,
        description: 'item description',
        unit: 1
    };

    var stubItemUnit = {id: itemUnitId, name: 'Unit name'};


    beforeEach(function () {
        module('SalesOrderItem');

        inject(function (SalesOrderItemService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            salesOrderItemEndpointUrl = EumsConfig.BACKEND_URLS.SALES_ORDER_ITEM;
            itemEndpointUrl = EumsConfig.BACKEND_URLS.ITEM;
            itemUnitEndpointUrl = EumsConfig.BACKEND_URLS.ITEM_UNIT;
            salesOrderItemService = SalesOrderItemService;
        });

        mockBackend.whenGET(itemUnitEndpointUrl + itemUnitId + '/').respond(stubItemUnit);
        mockBackend.whenGET(itemEndpointUrl + itemId + '/').respond(stubItem);
        mockBackend.whenGET(salesOrderItemEndpointUrl + salesOrderItemId + '/').respond(stubSalesOrderItem);
    });

    it('should get item details', function (done) {
        var expectedSalesOrderItem = { id: 1, sales_order: '1',
            item: { id: 1, description: 'item description', unit: { id: 1, name: 'Unit name' } },
            quantity: 100, net_price: 10, net_value: 1000, issue_date: '2014-10-02', delivery_date: '2014-10-02',
            distributionplanlineitem_set: []};

        salesOrderItemService.getSalesOrderItem(salesOrderItemId).then(function (salesOrderItem) {
            expect(salesOrderItem).toEqual(expectedSalesOrderItem);
            done();
        });
        mockBackend.flush();
    });
});
