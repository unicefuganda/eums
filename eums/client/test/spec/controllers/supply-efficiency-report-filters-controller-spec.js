describe('Supply Efficiency Report Filter Controller Spec', function () {

    var scope;
    beforeEach(function () {
        module('SupplyEfficiencyReportFilters');

        inject(function ($rootScope, $controller) {
            scope = $rootScope.$new();
            spyOn(scope, '$broadcast');
            spyOn(scope, '$emit');
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

    it('should emit an event when filter data changes', function () {
        scope.filters = {
            orderNumber: 810,
            startDate: '2015-10-10',
            endDate: '2015-10-30',
            programme: 3,
            consignee: 1,
            item: 4,
            location: 5
        };

        scope.$apply();

        scope.filters.orderNumber = 850;

        expect(scope.$emit).toHaveBeenCalledWith('filters-changed', scope.filters);

    });
});
