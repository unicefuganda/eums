describe('IpFeedbackReportsController', function () {
    var scope, q, location, mockReportService, deferredResult, mockLoader;

    beforeEach(function () {
        module('IpFeedbackReports');

        mockReportService = jasmine.createSpyObj('mockReportService', ['ipFeedbackReport']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader']);

        inject(function ($controller, $q, $location, $rootScope) {
            deferredResult = $q.defer();
            scope = $rootScope.$new();
            location = $location;

            mockReportService.ipFeedbackReport.and.returnValue(deferredResult.promise);

            $controller('IpFeedbackReportsController', {
                $scope: scope,
                $location: location,
                ReportService: mockReportService,
                LoaderService: mockLoader
            });
        });
    });

    describe('on load', function () {
        it('should show the loader and hide it after the loading data', function () {
            deferredResult.resolve([]);
            scope.$apply();

            expect(mockLoader.showLoader).toHaveBeenCalled();
            expect(mockLoader.showLoader.calls.count()).toEqual(1);

            expect(mockLoader.hideLoader).toHaveBeenCalled();
            expect(mockLoader.hideLoader.calls.count()).toEqual(1);
        });

        it('should call reports service', function () {
            var report = [{id: 3}, {id: 33}];
            deferredResult.resolve(report);
            scope.$apply();

            expect(mockReportService.ipFeedbackReport).toHaveBeenCalled();
            expect(scope.report).toEqual(report)
        });
    });

});
