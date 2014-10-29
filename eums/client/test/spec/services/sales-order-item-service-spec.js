describe('Sales Order Item Service', function () {

    var salesOrderItemEndpointUrl, itemEndpointUrl, itemUnitEndpointUrl,
        distributionPlanLineItemEndpointUrl, distributionPlanNodeEndpointUrl;
    var mockBackend;
    var salesOrderItemService;

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
        information: {
            distributionplanlineitem_set: []
        }
    };

    var stubItem = {
        id: itemId,
        description: 'item description',
        unit: 1
    };

    var stubItemUnit = {id: itemUnitId, name: 'Unit name'};

    beforeEach(function () {
        module('SalesOrderItem');

        inject(function ($httpBackend, SalesOrderItemService, EumsConfig) {
            mockBackend = $httpBackend;
            itemEndpointUrl = EumsConfig.BACKEND_URLS.ITEM;
            itemUnitEndpointUrl = EumsConfig.BACKEND_URLS.ITEM_UNIT;
            salesOrderItemService = SalesOrderItemService;
            salesOrderItemEndpointUrl = EumsConfig.BACKEND_URLS.SALES_ORDER_ITEM;
            distributionPlanLineItemEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM;
            distributionPlanNodeEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE;
        });

        mockBackend.whenGET(itemUnitEndpointUrl + itemUnitId + '/').respond(stubItemUnit);
        mockBackend.whenGET(itemEndpointUrl + itemId + '/').respond(stubItem);
        mockBackend.whenGET(salesOrderItemEndpointUrl + salesOrderItemId + '/').respond(stubSalesOrderItem);
    });
    it('should get item details', function (done) {
        var expectedSalesOrderItem = {
            id: 1, sales_order: '1',
            item: {id: 1, description: 'item description', unit: {id: 1, name: 'Unit name'}},
            quantity: 100, net_price: 10, net_value: 1000, issue_date: '2014-10-02', delivery_date: '2014-10-02',
            information: {
                distributionplanlineitem_set: []
            }
        };

        salesOrderItemService.getSalesOrderItem(salesOrderItemId).then(function (salesOrderItem) {
            expect(salesOrderItem).toEqual(expectedSalesOrderItem);
            done();
        });
        mockBackend.flush();
    });


    it('should provide top level distribution plan line items', function (done) {
        var stubLineItemWithParent = {id: 42, distribution_plan_node: 42};
        var stubPlanNodeWithParent = {id: 42, parent: 42};
        var stubLineItemWithoutParent = {id: 56, distribution_plan_node: 56};
        var stubPlanNodeWithoutParent = {id: 56, parent: null};
        stubSalesOrderItem.information.distributionplanlineitem_set = [42, 56];

        var expectedLineItemSet = [56];

        mockBackend
            .whenGET(distributionPlanLineItemEndpointUrl + stubLineItemWithParent.id + '/')
            .respond(stubLineItemWithParent);
        mockBackend
            .whenGET(distributionPlanNodeEndpointUrl + stubPlanNodeWithParent.id + '/')
            .respond(stubPlanNodeWithParent);

        mockBackend
            .whenGET(distributionPlanLineItemEndpointUrl + stubLineItemWithoutParent.id + '/')
            .respond(stubLineItemWithoutParent);
        mockBackend
            .whenGET(distributionPlanNodeEndpointUrl + stubPlanNodeWithoutParent.id + '/')
            .respond(stubPlanNodeWithoutParent);

        salesOrderItemService
            .getTopLevelDistributionPlanLineItems(stubSalesOrderItem)
            .then(function (distributionPlanLineItemSet) {
                expect(distributionPlanLineItemSet).toEqual(expectedLineItemSet);
                done();
            });
        mockBackend.flush();
    });
});
