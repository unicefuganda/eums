describe('Distribution Plan Node Service', function() {

    var planNodeService, mockBackend, planNodeEndpointUrl, mockLineItemService, mockConsigneeService, q,
        mockContactService;

    var planNodeId = 1, lineItemOneId = 1, lineItemTwoId = 2, consigneeId = 1, contactId = 1;

    var stubPlanNode = {
        id: planNodeId,
        parent: null,
        distribution_plan: 1,
        location: 'Kampala',
        mode_of_delivery: 'Warehouse',
        contact_person_id: contactId,
        children: [2],
        distributionplanlineitem_set: [lineItemOneId, lineItemTwoId],
        consignee: consigneeId
    };

    var fullLineItemOne = {
        id: lineItemOneId,
        item: 1,
        quantity: 10,
        under_current_supply_plan: false,
        planned_distribution_date: '2014-02-23',
        remark: 'In good condition',
        distribution_plan_node: planNodeId
    };

    var fullLineItemTwo = {
        id: lineItemTwoId,
        item: 2,
        quantity: 10,
        under_current_supply_plan: false,
        planned_distribution_date: '2014-02-23',
        remark: 'In bad condition',
        distribution_plan_node: planNodeId
    };

    var fullConsignee = {
        id: consigneeId,
        name: 'Save the Children'
    };

    var fullContact = {
        id: contactId, firstName: 'Andrew',
        lastName: 'Mukiza', phone: '+234778945674'
    };

    var expectedPlanNode = {
        id: planNodeId,
        parent: null,
        distribution_plan: 1,
        location: 'Kampala',
        mode_of_delivery: 'Warehouse',
        children: [2],
        distributionplanlineitem_set: [lineItemOneId, lineItemTwoId],
        consignee: fullConsignee,
        contactPerson: fullContact,
        lineItems: [fullLineItemOne, fullLineItemTwo]
    };

    beforeEach(function() {
        module('DistributionPlanNode');

        mockLineItemService = jasmine.createSpyObj('mockLineItemService', ['getLineItem']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['getConsigneeById']);
        mockContactService = jasmine.createSpyObj('mockContactService', ['getContactById']);

        module(function($provide) {
            $provide.value('DistributionPlanLineItemService', mockLineItemService);
            $provide.value('ConsigneeService', mockConsigneeService);
            $provide.value('ContactService', mockContactService);
        });

        inject(function(DistributionPlanNodeService, $httpBackend, EumsConfig, $q) {
            q = $q;
            mockLineItemService.getLineItem.and.callFake(fakeGetLineItemDetails);

            var deferredConsigneeRequest = q.defer();
            deferredConsigneeRequest.resolve(fullConsignee);
            mockConsigneeService.getConsigneeById.and.returnValue(deferredConsigneeRequest.promise);

            var deferredContactRequest = q.defer();
            deferredContactRequest.resolve(fullContact);
            mockContactService.getContactById.and.returnValue(deferredContactRequest.promise);

            mockBackend = $httpBackend;
            planNodeEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE;
            planNodeService = DistributionPlanNodeService;
        });
    });

    it('should create node with neither parent nor children', function(done) {
        var planId = 1, consigneeId = 1;
        var stubCreatedNode = {
            id: 1, parent: null, distribution_plan: planId, consignee: consigneeId,
            distributionplanlineitem_set: [], children: [], tree_position: 'END_USER'
        };
        mockBackend.whenPOST(planNodeEndpointUrl).respond(201, stubCreatedNode);
        planNodeService.createNode({distribution_plan: planId, consignee: consigneeId, tree_position: 'END_USER'})
            .then(function(createdNode) {
                expect(createdNode).toEqual(stubCreatedNode);
                done();
            });
        mockBackend.flush();
    });

    it('should get node with full details', function(done) {
        mockBackend.whenGET(planNodeEndpointUrl + planNodeId + '/').respond(stubPlanNode);
        planNodeService.getPlanNodeDetails(planNodeId).then(function(returnedPlanNode) {
            expect(returnedPlanNode).toEqual(expectedPlanNode);
            done();
        });
        mockBackend.flush();
    });

    var fakeGetLineItemDetails = function() {
        var lineItemId = arguments[0];

        var deferredLineItemOneRequest = q.defer();
        deferredLineItemOneRequest.resolve(fullLineItemOne);

        var deferredLineItemTwoRequest = q.defer();
        deferredLineItemTwoRequest.resolve(fullLineItemTwo);

        if(lineItemId === lineItemOneId) {
            return deferredLineItemOneRequest.promise;
        }
        else if(lineItemId === lineItemTwoId) {
            return deferredLineItemTwoRequest.promise;
        }
        return null;
    };
});

