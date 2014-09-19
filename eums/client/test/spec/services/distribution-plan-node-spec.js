describe('Distribution Plan Node Service', function() {

    var planNodeService, mockBackend, planNodeEndpointUrl, mockLineItemService, mockConsigneeService, q;

    var planNodeId = 1;
    var lineItemOneId = 1;
    var lineItemTwoId = 2;
    var consigneeId = 1;

    var stubPlanNode = {
        id: planNodeId,
        parent: null,
        distribution_plan: 1,
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
        destination_location: 'Kampala',
        remark: 'In good condition',
        distribution_plan_node: planNodeId
    };

    var fullLineItemTwo = {
        id: lineItemTwoId,
        item: 2,
        quantity: 10,
        under_current_supply_plan: false,
        planned_distribution_date: '2014-02-23',
        destination_location: 'Kampala',
        remark: 'In bad condition',
        distribution_plan_node: planNodeId
    };

    var fullConsignee = {
        id: consigneeId,
        name: 'Save the Children',
        contactPerson: {
            id: 1, firstName: 'Andrew',
            lastName: 'Mukiza', phone: '+234778945674'
        }
    };

    var expectedPlanNode = {
        id: planNodeId,
        parent: null,
        distribution_plan: 1,
        children: [2],
        distributionplanlineitem_set: [lineItemOneId, lineItemTwoId],
        consignee: fullConsignee,
        lineItems: [fullLineItemOne, fullLineItemTwo]
    };

    beforeEach(function() {
        module('DistributionPlanNode');

        mockLineItemService = jasmine.createSpyObj('mockLineItemService', ['getLineItemDetails']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['getConsigneeDetails']);

        module(function($provide) {
            $provide.value('DistributionPlanLineItemService', mockLineItemService);
            $provide.value('ConsigneeService', mockConsigneeService);
        });

        inject(function(DistributionPlanNodeService, $httpBackend, EumsConfig, $q) {
            q = $q;
            mockLineItemService.getLineItemDetails.and.callFake(fakeGetLineItemDetails);

            var deferredConsigneeRequest = q.defer();
            deferredConsigneeRequest.resolve(fullConsignee);
            mockConsigneeService.getConsigneeDetails.and.returnValue(deferredConsigneeRequest.promise);

            mockBackend = $httpBackend;
            planNodeEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE;
            planNodeService = DistributionPlanNodeService;
        });
    });

    it('should get line item with full item details', function(done) {
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

