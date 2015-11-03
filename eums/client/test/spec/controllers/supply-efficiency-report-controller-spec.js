describe('Supply Efficiency Report Controller Spec', function () {

    var scope, childScope, mockReportService, mockReport;
    var mockViews = {DELIVERY: 1};

    beforeEach(function () {
        module('SupplyEfficiencyReport');
        mockReportService = jasmine.createSpyObj('mockSupplyEfficiencyReportService', ['generate']);

        inject(function ($rootScope, $controller, $q) {
            mockReportService.generate.and.returnValue($q.when(mockReport));
            mockReportService.VIEWS = mockViews;

            scope = $rootScope.$new();
            childScope = scope.$new();
            $controller('SupplyEfficiencyReportController', {
                $scope: scope,
                SupplyEfficiencyReportService: mockReportService
            });
        });
    });

    it('should receive filters from filters controller', function () {
        var newFilters = {consignee: 1};
        childScope.$emit('filters-changed', newFilters);
        scope.$apply();
        expect(scope.filters).toEqual(newFilters);
    });

    it('should generate new report when filters change', function () {
        childScope.$emit('filters-changed', {consignee: 3});
        scope.$apply();
        expect(mockReportService.generate).toHaveBeenCalledWith(mockViews.DELIVERY, {consignee: 3})
    });
});
