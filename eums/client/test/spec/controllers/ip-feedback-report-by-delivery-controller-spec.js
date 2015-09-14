describe('IpFeedbackReportController', function () {
    var scope, location, mockReportService, deferredResult, mockLoader, timeout;

    beforeEach(function () {
        module('IpFeedbackReportByDelivery');

        mockReportService = jasmine.createSpyObj('mockReportService', ['ipFeedbackReportByDelivery']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader']);

        inject(function ($controller, $q, $location, $rootScope, $timeout) {
            deferredResult = $q.defer();
            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;

            mockReportService.ipFeedbackReportByDelivery.and.returnValue(deferredResult.promise);

            $controller('IpFeedbackReportByDeliveryController', {
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
            var response = {results: [{id: 4}, {id: 24}]};
            deferredResult.resolve(response);
            scope.$apply();

            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalled();
            expect(scope.report).toEqual(response.results)
        });
    });


});
