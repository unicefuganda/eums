describe('Supply Efficiency Report Filter Controller Spec', function () {

    var scope;
    beforeEach(function () {
        module('SupplyEfficiencyReportFilters');

        inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            spyOn(scope, '$broadcast');
            $controller('SupplyEfficiencyReportFiltersController', {
                $scope: scope
            });
        });
    });

    it('should clear all filters', function () {
        scope.filters = {orderNumber: 810};
        scope.$apply();

        scope.clearFilters();

        expect(scope.$broadcast).toHaveBeenCalledWith('clear-consignee');
        expect(scope.$broadcast).toHaveBeenCalledWith('clear-list');
        expect(scope.$broadcast).toHaveBeenCalledWith('clear-programme');
        expect(scope.$broadcast).toHaveBeenCalledWith('clear-item');
        expect(scope.filters).toEqual({});
    });

});
