describe('AlertsController', function () {

    var scope;
    var mockAlertsService;
    var deferredAlerts;

    beforeEach(function () {
        module('Alerts');

        mockAlertsService = jasmine.createSpyObj('mockAlertsService', ['all'])

        inject(function ($controller, $rootScope, $q) {

            deferredAlerts = $q.defer();
            mockAlertsService.all.and.returnValue(deferredAlerts.promise)

            scope = $rootScope.$new();

            $controller('AlertsController', {
                $scope: scope,
                AlertsService: mockAlertsService
            });
        });
    });

    it('should set alerts on scope from result of service call', function() {
        deferredAlerts.resolve('some alerts')
        scope.$apply();
        expect(scope.alerts).toBe('some alerts');
    });

    it('should call alerts service on load', function () {
        scope.$apply();
        expect(mockAlertsService.all).toHaveBeenCalled();
    });
});