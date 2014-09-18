xdescribe('DistributionPlanService', function() {
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
//            mockBackend.whenGET(EumsConfig.BACKEND_URL + 'distribution-plan')
            mockBackend.whenGET('/api/distribution-plan')
                .respond(stubDistributionPlans);
            distributionPlanService = DistributionPlanService;
        });
    });

    it('should fetch all distribution plans', function(done) {
        distributionPlanService.fetchPlans().then(function(plans) {
            expect(plans).toEqual([]);
            done();
        });
        mockBackend.flush();
    });
});