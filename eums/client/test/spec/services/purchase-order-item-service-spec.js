describe('Purchase Order Item Service', function () {

    var purchaseOrderItemService,
        endpointUrl,
        distributionPlanNodeService,
        mockServiceFactory;

    beforeEach(function () {
        module('PurchaseOrderItem');

        mockServiceFactory = jasmine.createSpyObj('mockFactoryService', ['create']);

        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
        });

        inject(function (PurchaseOrderItemService, EumsConfig, DistributionPlanNodeService) {
            purchaseOrderItemService = PurchaseOrderItemService;
            distributionPlanNodeService = DistributionPlanNodeService;
            endpointUrl = EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM;
        });
    });

    it('should invoke create on Factory Service with right params', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: endpointUrl,
            propertyServiceMap: {distributionplannode_set: distributionPlanNodeService},
            methods: jasmine.any(Object)
        });
    });

    //it('should return top level distribution plan nodes', function (done) {
    //    var stubContact = {
    //        id: 3,
    //        firstName: 'Andrew',
    //        lastName: 'Mukiza',
    //        phone: '+234778945674'
    //    };
    //
    //    var stubPlanNodeWithoutParent = {id: 55, parent: null, consignee: 3, contact_person_id: 3};
    //    var stubPlanNodeWithParent = {id: 41, parent: stubPlanNodeWithoutParent.id, consignee: 3, contact_person_id: 3};
    //    var stubConsignee = {id: stubContact.id, name: 'Stub Consignee'};
    //    stubSalesOrderItem.distributionplannodeSet = [{id: 41}, {id: 55}];
    //
    //    var expectedPlanNodeSet = [{
    //        id: 55,
    //        parent: null,
    //        consignee: stubConsignee,
    //        contactPersonId: stubContact,
    //        contactPerson: stubContact
    //    }];
    //
    //    mockBackend
    //        .whenGET(distributionPlanNodeEndpointUrl + stubPlanNodeWithParent.id + '/')
    //        .respond(stubPlanNodeWithParent);
    //
    //    mockBackend
    //        .whenGET(distributionPlanNodeEndpointUrl + stubPlanNodeWithoutParent.id + '/')
    //        .respond(stubPlanNodeWithoutParent);
    //
    //    mockBackend
    //        .whenGET(consigneeEndpointUrl + stubPlanNodeWithoutParent.consignee + '/')
    //        .respond(stubConsignee);
    //
    //    mockBackend
    //        .whenGET(contactEndpointUrl + stubContact.id + '/')
    //        .respond(stubContact);
    //
    //    distributionPlanNodeService
    //        .getTopLevelDistributionPlanNodes(stubSalesOrderItem)
    //        .then(function (distributionPlanNodeSet) {
    //            expect(distributionPlanNodeSet).toEqual(expectedPlanNodeSet);
    //            done();
    //        });
    //    mockBackend.flush();
    //});
});
