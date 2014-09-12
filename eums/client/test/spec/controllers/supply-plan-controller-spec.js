'use strict';

describe('Controller: SupplyPlan', function() {

    beforeEach(module('SupplyPlan'));

    var scope, mockSupplyPlanService;
    var mockPlans = {'id': 1, 'program_code': 'STEP'};
    var mockHttpResponse = {data: mockPlans};

    beforeEach(inject(function($controller, $rootScope, $q) {
        mockSupplyPlanService = jasmine.createSpyObj('mockSupplyPlanService', ['all']);

        scope = $rootScope.$new();
        var deferred = $q.defer();
        mockSupplyPlanService.all.and.returnValue(deferred.promise);
        deferred.resolve(mockHttpResponse);

//        $controller('SupplyPlanController', {
//            $scope: scope, SupplyPlanService: mockSupplyPlanService
//        });
    }));

    it('should do nothing', function() {
        expect(true).toBeTruthy();
    });

    xit('should attach a list of supply plans to the scope', function() {
        scope.$apply();
        expect(scope.supplyPlans).toBe(mockPlans);
    });
});
