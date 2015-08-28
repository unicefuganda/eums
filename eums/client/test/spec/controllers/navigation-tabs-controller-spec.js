describe('Navigation Tabs Controller', function() {

    var scope, location, mockAlertsService,
        alertsCountResponse = {'total':4, 'unresolved':2};
    beforeEach(function() {
        module('NavigationTabs');
        mockAlertsService = jasmine.createSpyObj('mockAlertsService', ['get']);

        inject(function($rootScope, $location, $controller, $q) {
            scope = $rootScope.$new();
            location = $location;
            mockAlertsService.get.and.returnValue($q.when(alertsCountResponse));

            $controller('NavigationTabsController', {
                $scope: scope, $location: location, AlertsService: mockAlertsService
            });
        });

    });

    it('should activate tab that points to current location', function() {
        location.path('some-path');
        expect(scope.isActive('/some-path')).toBeTruthy();
    });

    it('should deactivate tab which point to page that is not the current location', function() {
        location.path('/some-path');
        expect(scope.isActive('/other-path')).toBeFalsy();
    });

    it('should load unresloved alerts count to the scope', function() {
        scope.$apply();
        expect(mockAlertsService.get).toHaveBeenCalledWith('/count');
        expect(scope.unresolvedAlertsCount).toEqual(2);
    });
});
