describe('Distribution Plan Service', function() {
    var distributionPlanService, mockBackend;
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

    beforeEach(function() {
        module('DistributionPlan');

        inject(function(DistributionPlanService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            mockBackend.whenGET(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN)
                .respond(stubDistributionPlans);
            distributionPlanService = DistributionPlanService;
        });
    });

    it('should fetch all distribution plans', function(done) {
        distributionPlanService.fetchPlans().then(function(response) {
            expect(response.data).toEqual(stubDistributionPlans);
            done();
        });
        mockBackend.flush();
    });
});