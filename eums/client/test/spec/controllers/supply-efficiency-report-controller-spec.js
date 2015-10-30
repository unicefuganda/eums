describe('Supply Efficiency Report Controller Spec', function () {

    var scope, childScope;
    beforeEach(function () {
        module('SupplyEfficiencyReport');

        inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            childScope = scope.$new();
            $controller('SupplyEfficiencyReportController', {
                $scope: scope
            });
        });
    });

    it('should receive filters from filters controller', function () {
        var newFilters = {consignee: 1};
        childScope.$emit('filters-changed', newFilters);
        scope.$apply();
        expect(scope.filters).toEqual(newFilters);
    });
});
