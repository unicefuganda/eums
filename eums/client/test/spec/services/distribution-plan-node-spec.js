describe('Distribution Plan Node Service', function () {

    var planNodeService, mockConsigneeService, mockContactService;
    var mockBackend, q;
    var planNodeEndpointUrl;
    var nodeResponsesEndpointUrl;

    var planNodeId = 1, childPlanNodeId = 2, consigneeId = 1, contactId = 1, itemId = 1;

    var stubPlanNode = {
        id: planNodeId,
        parent: null,
        distributionPlan: 1,
        location: 'Kampala',
        contact_person_id: contactId,
        children: [2],
        consignee: consigneeId,
        item: itemId,
        quantity: 10,
        underCurrentSupplyPlan: false,
        plannedDistributionDate: '2014-02-23',
        remark: 'In good condition',
        track: true
    };

    var stubChildPlanNode = {
        id: childPlanNodeId,
        parent: null,
        distributionPlan: 1,
        location: 'Kampala',
        contactPersonId: contactId,
        children: null,
        consignee: consigneeId,
        item: itemId,
        quantity: 10,
        underCurrentSupplyPlan: false,
        plannedDistributionDate: '2014-02-23',
        remark: 'In good condition',
        track: true
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
        distributionPlan: 1,
        location: 'Kampala',
        contactPersonId: fullContact,
        children: [stubChildPlanNode],
        consignee: fullConsignee,
        item: itemId,
        quantity: 10,
        underCurrentSupplyPlan: false,
        plannedDistributionDate: '2014-02-23',
        remark: 'In good condition',
        track: true,
        contactPerson: fullContact
    };

    var expectedNodeResponse = {
        'node': {
            'plan_id': 53,
            'contact_person_id': '54578a695d1b1dbd44790208',
            'consignee': 17,
            'id': 106,
            'location': 'Adjumani'
        },
        'responses': {
            'qualityOfProduct': {
                'id': 178,
                'value': 3,
                'formatted_value': 'Good'
            },
            'amountReceived': {
                'id': 52,
                'value': 25,
                'formatted_value': '25'
            },
            'dateOfReceipt': {
                'id': 43,
                'value': '04/10/2014',
                'formatted_value': '04/10/2014'
            },
            'productReceived': {
                'id': 103,
                'value': 1,
                'formatted_value': 'Yes'
            }
        }
    };

    beforeEach(function () {
        module('DistributionPlanNode');

        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['get']);
        mockContactService = jasmine.createSpyObj('mockContactService', ['get']);

        module(function ($provide) {
            $provide.value('ConsigneeService', mockConsigneeService);
            $provide.value('ContactService', mockContactService);
        });

        inject(function (DistributionPlanNodeService, $httpBackend, EumsConfig, $q) {
            q = $q;

            var deferredConsigneeRequest = q.defer();
            deferredConsigneeRequest.resolve(fullConsignee);
            mockConsigneeService.get.and.returnValue(deferredConsigneeRequest.promise);

            var deferredContactRequest = q.defer();
            deferredContactRequest.resolve(fullContact);
            mockContactService.get.and.returnValue(deferredContactRequest.promise);

            mockBackend = $httpBackend;
            planNodeEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE;
            nodeResponsesEndpointUrl = EumsConfig.BACKEND_URLS.NODE_RESPONSES;
            planNodeService = DistributionPlanNodeService;
        });
    });

    it('should create node with neither parent nor children', function (done) {
        var planId = 1, consigneeId = 1;
        var stubCreatedNode = {
            id: 1, parent: null, distribution_plan: planId, consignee: consigneeId,
            children: [], tree_position: 'END_USER', item: itemId,
            quantity: 10, under_current_supply_plan: false,
            plannedDistributionDate: '2014-02-23',
            remark: 'In bad condition',
            track: true
        };
        mockBackend.whenPOST(planNodeEndpointUrl).respond(201, stubCreatedNode);
        planNodeService.create({
            distribution_plan: planId, consignee: consigneeId, tree_position: 'END_USER', item: itemId,
            quantity: 10, plannedDistributionDate: '2014-02-23', remark: 'In bad condition',
            track: true
        }).then(function (createdNode) {
            expect(createdNode).toEqual(stubCreatedNode);
            done();
        });
        mockBackend.flush();
    });

    it('should only return a response when the status is not 201', function () {
        var planId = 1, consigneeId = 1;
        var stubCreatedNode = {
            id: 1, parent: null, distribution_plan: planId, consignee: consigneeId,
            children: [], tree_position: 'END_USER', item: itemId,
            quantity: 10, under_current_supply_plan: false,
            plannedDistributionDate: '2014-02-23',
            remark: 'In bad condition',
            track: true
        };
        var stubNewNode = {
            distributionPlan: planId, consignee: consigneeId, tree_position: 'END_USER',
            item: itemId,
            quantity: 10,
            underCurrentSupplyPlan: false,
            plannedDistributionDate: '2014-02-23',
            remark: 'In bad condition',
            track: true
        };

        var stubExpectedNode = {
            distribution_plan: planId, consignee: consigneeId, tree_position: 'END_USER',
            item: itemId,
            quantity: 10,
            under_current_supply_plan: false,
            planned_distribution_date: '2014-02-23',
            remark: 'In bad condition',
            track: true
        };
        mockBackend.expectPOST(planNodeEndpointUrl, stubExpectedNode).respond(201, stubCreatedNode);
        planNodeService.create(stubNewNode).then(function (createdNode) {
            expect(createdNode).toEqual(stubCreatedNode);
        });
        mockBackend.flush();
    });

    it('should get node with full details', function (done) {
        mockBackend.whenGET(planNodeEndpointUrl + planNodeId + '/').respond(stubPlanNode);
        mockBackend.whenGET(planNodeEndpointUrl + childPlanNodeId + '/').respond(stubChildPlanNode);
        planNodeService.getPlanNodeDetails(planNodeId).then(function (returnedPlanNode) {
            expect(returnedPlanNode).toEqual(expectedPlanNode);
            done();
        });
        mockBackend.flush();
    });

    it('should update node', function (done) {
        var updatedNode = {id: 1};
        mockBackend.expectPUT(planNodeEndpointUrl + planNodeId + '/', updatedNode).respond(200);
        planNodeService.update(updatedNode).then(function (status) {
            expect(status).toEqual(200);
            done();
        });
        mockBackend.flush();
    });

    it('should get node response', function (done) {
        mockBackend.whenGET(nodeResponsesEndpointUrl + planNodeId + '/').respond(expectedNodeResponse);
        mockBackend.whenGET(nodeResponsesEndpointUrl + planNodeId + '/').respond(expectedNodeResponse);
        planNodeService.getNodeResponse(planNodeId).then(function (returnedNodeResponse) {
            expect(returnedNodeResponse).toEqual(expectedNodeResponse);
            done();
        });
        mockBackend.flush();
    });

});

