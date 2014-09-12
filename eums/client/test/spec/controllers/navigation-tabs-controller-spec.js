describe('Navigation Tabs Controller', function() {

    var scope, location;
    beforeEach(function() {
        module('NavigationTabs');

        inject(function($rootScope, $location, $controller) {
            scope = $rootScope.$new();
            location = $location;

            $controller('NavigationTabsController', {
                $scope: scope, $location: location
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
});
