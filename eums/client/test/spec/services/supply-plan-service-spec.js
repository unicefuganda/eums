describe('SupplyPlanService', function() {
    var supplyPlanService, mockHttpService;
    var mockPlans = [
        {'program_code': 'STEP'}
    ];

    beforeEach(function() {
        module('SupplyPlan');

        mockHttpService = jasmine.createSpyObj('mockHttpService', ['get']);

        module(function($provide) {
            $provide.value('$http', mockHttpService);
        });

        inject(function(SupplyPlanService, $q) {
            var supplyPlanRequest = $q.defer();
            supplyPlanRequest.resolve(mockPlans);
            mockHttpService.get.and.returnValue(supplyPlanRequest.promise);
            supplyPlanService = SupplyPlanService;
        });
    });

    it('should fetch supply plans', function() {
        supplyPlanService.all().then(function(plans) {
            expect(plans).toEqual(mockPlans.data);
        });
    });
});
