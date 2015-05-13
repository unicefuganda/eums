describe('Sales Order Item Service', function () {

    var salesOrderItemEndpointUrl, itemEndpointUrl, itemUnitEndpointUrl,
        distributionPlanNodeEndpointUrl,
        consigneeEndpointUrl, poItemForSalesOrderItemEndpointUrl, contactEndpointUrl;

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
            distributionplannode_set: []
        },
        distributionplannode_set: []
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
            poItemForSalesOrderItemEndpointUrl = EumsConfig.BACKEND_URLS.PO_ITEM_FOR_SO_ITEM;
            distributionPlanNodeEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE;
            consigneeEndpointUrl = EumsConfig.BACKEND_URLS.CONSIGNEE;
            contactEndpointUrl = EumsConfig.CONTACT_SERVICE_URL;
        });

        mockBackend.whenGET(itemUnitEndpointUrl + itemUnitId + '/').respond(stubItemUnit);
        mockBackend.whenGET(itemEndpointUrl + itemId + '/').respond(stubItem);
        mockBackend.whenGET(salesOrderItemEndpointUrl + salesOrderItemId + '/').respond(stubSalesOrderItem);
    });

    xit('should get item details', function (done) {
        var expectedSalesOrderItem = {
            id: 1, sales_order: '1',
            item: {id: 1, description: 'item description', unit: {id: 1, name: 'Unit name'}},
            quantity: 100, net_price: 10, net_value: 1000, issue_date: '2014-10-02', delivery_date: '2014-10-02',
            information: {
                distributionplannode_set: []
            },
            distributionplannode_set: []
        };

        salesOrderItemService.getSalesOrderItem(salesOrderItemId).then(function (salesOrderItem) {
            expect(salesOrderItem).toEqual(expectedSalesOrderItem);
            done();
        });
        mockBackend.flush();
    });

    it('should get purchase order item details', function (done) {
        var stubPurchaseOrder = {
            id: 1,
            order_number: 1,
            sales_order: 1,
            date: '2014-10-06',
            purchaseorderitem_set: [1, 2],
            programme: 'TEST PROGRAMME'
        };

        var expectedPurchaseOrderItem = {
            id: 1,
            item_number: itemId,
            purchase_order: stubPurchaseOrder,
            sales_order_item_id: salesOrderItemId
        };

        mockBackend.whenGET(poItemForSalesOrderItemEndpointUrl + salesOrderItemId + '/').respond(expectedPurchaseOrderItem);

        salesOrderItemService.getPOItemforSOItem(salesOrderItemId).then(function (purchaseOrderItem) {
            expect(purchaseOrderItem).toEqual(expectedPurchaseOrderItem);
            done();
        });
        mockBackend.flush();
    });

    it('should return top level distribution plan nodes', function (done) {
        var stubContact = {
            _id: 3,
            firstName: 'Andrew',
            lastName: 'Mukiza',
            phone: '+234778945674'
        };

        var stubPlanNodeWithoutParent = {id: 55, parent: null, consignee: 3, contact_person_id: 3};
        var stubPlanNodeWithParent = {id: 41, parent: stubPlanNodeWithoutParent.id, consignee: 3, contact_person_id: 3};
        var stubConsignee = {id: stubContact._id, name: 'Stub Consignee'};
        stubSalesOrderItem.distributionplannode_set = [41, 55];

        var expectedPlanNodeSet = [{
            id: 55,
            parent: null,
            consignee: stubConsignee,
            contact_person: stubContact,
            contact_person_id: stubContact._id
        }];

        mockBackend
            .whenGET(distributionPlanNodeEndpointUrl + stubPlanNodeWithParent.id + '/')
            .respond(stubPlanNodeWithParent);

        mockBackend
            .whenGET(distributionPlanNodeEndpointUrl + stubPlanNodeWithoutParent.id + '/')
            .respond(stubPlanNodeWithoutParent);

        mockBackend
            .whenGET(consigneeEndpointUrl + stubPlanNodeWithoutParent.consignee + '/')
            .respond(stubConsignee);

        mockBackend
            .whenGET(contactEndpointUrl + stubContact._id + '/')
            .respond(stubContact);

        salesOrderItemService
            .getTopLevelDistributionPlanNodes(stubSalesOrderItem)
            .then(function (distributionPlanNodeSet) {
                expect(distributionPlanNodeSet).toEqual(expectedPlanNodeSet);
                done();
            });
        mockBackend.flush();
    });
});
