describe('IpFeedbackReportsController', function () {
    var scope, q, location, mockReportService, deferedResult;

    beforeEach(function () {
        module('IpFeedbackReports');

        mockReportService = jasmine.createSpyObj('mockReportService', ['ipFeedbackReport']);

        inject(function ($controller, $q, $location, $rootScope) {
            deferedResult = $q.defer();
            scope = $rootScope.$new();
            location = $location;

            mockReportService.ipFeedbackReport.and.returnValue(deferedResult.promise);

            $controller('IpFeedbackReportsController', {
                $scope: scope,
                $location: location,
                ReportService: mockReportService
            });
        });
    });

    describe('on load', function () {
        it('should call reports service', function () {
            var report = [{id: 3}, {id: 33}];
            deferedResult.resolve(report);
            scope.$apply();

            expect(mockReportService.ipFeedbackReport).toHaveBeenCalled();
            expect(scope.report).toEqual(report)
        });
    });

});
