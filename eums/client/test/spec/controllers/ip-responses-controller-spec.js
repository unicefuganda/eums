describe('IPResponsesController', function () {

    var scope, q, mockReportService, deferredReportPromise;

    beforeEach(function () {
        module('IPResponses');

        mockReportService = jasmine.createSpyObj('ReportService', ['allIpResponses']);

        inject(function ($controller, $rootScope, $q) {

            deferredReportPromise = $q.defer();
            mockReportService.allIpResponses.and.returnValue(deferredReportPromise.promise);

            scope = $rootScope.$new();

            $controller('IPResponsesController', {
                $scope: scope,
                ReportService: mockReportService
            });
        });
    });

    it('should get ip responses', function() {
        deferredReportPromise.resolve('some response');
        scope.$apply();
        expect(scope.responses).toEqual('some response');
    });
});