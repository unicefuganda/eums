describe('Distribution Plan Service', function() {
    var distributionPlanService, mockBackend, distPlanEndpointUrl, nodeEndpointUrl;

    beforeEach(function() {
        module('DistributionPlan');

        inject(function(DistributionPlanService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;
            nodeEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE;
            distributionPlanService = DistributionPlanService;
        });
    });

    it('should fetch all distribution plans', function(done) {
        var stubDistributionPlans = [
            {
                id: 1,
                programme: 'Step'
            },
            {
                id: 2,
                programme: 'Alive'
            }
        ];

        mockBackend.whenGET(distPlanEndpointUrl).respond(stubDistributionPlans);
        distributionPlanService.fetchPlans().then(function(response) {
            expect(response.data).toEqual(stubDistributionPlans);
            done();
        });
        mockBackend.flush();
    });

    xit('should get distribution plan details', function(done) {
        var plan_id = 1;
        var stubPlan = {
            id: plan_id,
            programme: 'Step',
            distributionplannode_set: [1, 2]
        };
        var stubNode1 = {
            id: 1, parent: null, distribution_plan: plan_id, consignee: 1,
            children: [2], distributionplanlineitem_set: [1, 2]
        };

        var stubNode2 = {
            id: 2, parent: 1, distribution_plan: plan_id, consignee: 2,
            children: [], distributionplanlineitem_set: [3, 4]
        };

        var expectedNode1 = {
            id: 1

        };

        var expectedPlan = {
            id: plan_id,
            programme: 'Step',
            distributionplannode_set: [
                expectedNode1,
                {id: stubNode2.id}
            ]
        };


        mockBackend.whenGET(distPlanEndpointUrl + plan_id + '/').respond(stubPlan);
        mockBackend.whenGET(nodeEndpointUrl + stubNode1.id + '/').respond(stubPlan);
        distributionPlanService.getPlanDetails(plan_id).then(function(response) {
            expect(response.data).toEqual(expectedPlan);
            done();
        });
        mockBackend.flush();
    });
});