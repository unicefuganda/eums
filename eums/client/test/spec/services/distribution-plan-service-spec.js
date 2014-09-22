describe('Distribution Plan Service', function() {
    var distributionPlanService, mockBackend, distPlanEndpointUrl, mockNodeService, q, http, config;
    var planId = 1;

    var stubPlanOne = {
        id: planId,
        programme: 1,
        distributionplannode_set: [1, 2]
    };

    var fullNodeOne = {
        id: 1,
        parent: null,
        distribution_plan: 1,
        children: [2],
        distributionplanlineitem_set: [1, 2],
        consignee: {id: 1, details: 'placeholder'},
        nodes: [
            {id: 1, details: 'placeholder'},
            {id: 2, details: 'placeholder'}
        ]
    };

    var fullNodeTwo = {
        id: 2,
        parent: 1,
        distribution_plan: 1,
        children: [],
        distributionplanlineitem_set: [3, 4],
        consignee: {id: 2, details: 'placeholder'},
        nodes: [
            {id: 3, details: 'placeholder'},
            {id: 4, details: 'placeholder'}
        ]
    };

    var stubDistributionPlans = [
        stubPlanOne,
        {
            id: 2,
            programme: 2,
            distributionplannode_set: []
        }
    ];

    var expectedPlan = {
        id: planId,
        programme: 1,
        distributionplannode_set: [1, 2],
        nodes: [fullNodeOne, fullNodeTwo]
    };

    beforeEach(function() {
        module('DistributionPlan');

        mockNodeService = jasmine.createSpyObj('mockNodeService', ['getPlanNodeDetails']);

        module(function($provide) {
            $provide.value('DistributionPlanNodeService', mockNodeService);
        });

        inject(function(DistributionPlanService, $httpBackend, $q, EumsConfig, $http) {
            mockNodeService.getPlanNodeDetails.and.callFake(fakeGetNodeDetails);
            q = $q;
            http = $http;
            config = EumsConfig;

            mockBackend = $httpBackend;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;
            distributionPlanService = DistributionPlanService;
        });
    });

    it('should create distribution plan', function(done) {
        var programmeId = 1;
        var stubCreatedPlan = {id: planId, programme: programmeId, distributionplannode_set: []};
        mockBackend.whenPOST(distPlanEndpointUrl).respond(201, stubCreatedPlan);
        distributionPlanService.createPlan({programme: programmeId}).then(function(createdPlan) {
            expect(stubCreatedPlan).toEqual(createdPlan);
            done();
        });
        mockBackend.flush();
    });

    it('should fetch all distribution plans', function(done) {
        mockBackend.whenGET(distPlanEndpointUrl).respond(stubDistributionPlans);
        distributionPlanService.fetchPlans().then(function(response) {
            expect(response.data).toEqual(stubDistributionPlans);
            done();
        });
        mockBackend.flush();
    });

    it('should get distribution plan details', function(done) {
        mockBackend.whenGET(distPlanEndpointUrl + planId + '/').respond(stubPlanOne);
        distributionPlanService.getPlanDetails(planId).then(function(detailedPlan) {
            expect(detailedPlan).toEqual(expectedPlan);
            done();
        });
        mockBackend.flush();
    });

    var fakeGetNodeDetails = function() {
        var nodeId = arguments[0];

        var deferredNodeOneRequest = q.defer();
        deferredNodeOneRequest.resolve(fullNodeOne);

        var deferredNodeTwoRequest = q.defer();
        deferredNodeTwoRequest.resolve(fullNodeTwo);

        if(nodeId === fullNodeOne.id) {
            return deferredNodeOneRequest.promise;
        }
        else if(nodeId === fullNodeTwo.id) {
            return deferredNodeTwoRequest.promise;
        }

        return null;
    };
});