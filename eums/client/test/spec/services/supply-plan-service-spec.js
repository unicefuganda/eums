describe('SupplyPlanService', function() {
    var supplyPlan, mockHttpService;
    var mockPlans = [
        {'program_code': 'STEP'}
    ];

    beforeEach(function() {
        module('SupplyPlanService');

        mockHttpService = jasmine.createSpyObj('mockHttpService', ['get']);

        module(function($provide) {
            $provide.value('$http', mockHttpService);
        });

        inject(function(SupplyPlan, $q) {
            var supplyPlanRequest = $q.defer();
            supplyPlanRequest.resolve(mockPlans);
            mockHttpService.get.and.returnValue(supplyPlanRequest.promise);
            supplyPlan = SupplyPlan;
        });
    });

    it('should fetch supply plans', function() {
        supplyPlan.all().then(function(plans) {
            expect(plans).toEqual(mockPlans);
        });
    });
});
