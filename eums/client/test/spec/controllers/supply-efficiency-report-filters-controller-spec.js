describe('Supply Efficiency Report Filter Controller Spec', function () {
    var scope, mockSystemSettingsService;
    var stubSettings = {
        'notification_message': 'notification',
        'district_label': 'district'
    };

    beforeEach(function () {
        module('SupplyEfficiencyReportFilters');
        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings', 'getSettingsWithDefault']);

        inject(function ($rootScope, $q, $controller) {
            scope = $rootScope.$new();
            mockSystemSettingsService.getSettings.and.returnValue($q.when(stubSettings));
            mockSystemSettingsService.getSettingsWithDefault.and.returnValue($q.when(stubSettings));

            spyOn(scope, '$broadcast');
            spyOn(scope, '$emit');

            $controller('SupplyEfficiencyReportFiltersController', {
                $scope: scope,
                SystemSettingsService: mockSystemSettingsService
            });
        });
    });

    it('should filter by the first and last date of this year by default', function() {
        scope.$apply();
        var today = new Date();
        expect(scope.filters).toEqual({startDate: new Date(today.getFullYear(), 0, 1), endDate: new Date(today.getFullYear(), 11, 31)})
    });

    it('should clear all filters', function () {
        scope.filters = {orderNumber: 810};
        scope.$apply();
        scope.clearFilters();

        expect(scope.$broadcast).toHaveBeenCalledWith('clear-consignee');
        expect(scope.$broadcast).toHaveBeenCalledWith('clear-list');
        expect(scope.$broadcast).toHaveBeenCalledWith('clear-programme');
        expect(scope.$broadcast).toHaveBeenCalledWith('clear-item');
        var today = new Date();
        expect(scope.filters).toEqual({startDate: new Date(today.getFullYear(), 0, 1), endDate: new Date(today.getFullYear(), 11, 31)});
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
        scope.$apply();

        expect(scope.$emit).toHaveBeenCalledWith('filters-changed', scope.filters);
    });

    it('should remove filters with falsy from filters before broadcasting', function () {
        scope.filters = {
            item: 10,
            location: 5
        };
        var expectedFilters = {item: 10};

        scope.$apply();
        scope.filters.location = undefined;
        scope.$apply();

        expect(scope.$emit).toHaveBeenCalledWith('filters-changed', expectedFilters);
    });
});
