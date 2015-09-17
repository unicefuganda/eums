describe('IpFeedbackReportByItemController', function () {
    var scope, location, mockReportService, deferredResult, mockLoader, timeout;

    beforeEach(function () {
        module('IpFeedbackReportByItem');

        mockReportService = jasmine.createSpyObj('mockReportService', ['ipFeedbackReport']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader']);

        inject(function ($controller, $q, $location, $rootScope, $timeout) {
            deferredResult = $q.defer();
            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;

            mockReportService.ipFeedbackReport.and.returnValue(deferredResult.promise);

            $controller('IpFeedbackReportByItemController', {
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
            var response = {results: [{id: 3}, {id: 33}]};
            deferredResult.resolve(response);
            scope.$apply();

            expect(mockReportService.ipFeedbackReport).toHaveBeenCalled();
            expect(scope.report).toEqual(response.results)
        });
    });

    describe('on filtering', function () {
        it('should call endpoint with query params after ', function () {
            deferredResult.resolve({results: []});
            scope.$apply();

            var searchTerm = 'something';
            scope.searchTerm = searchTerm;
            scope.$apply();

            timeout.flush();
            expect(mockReportService.ipFeedbackReport.calls.count()).toEqual(2);
            expect(mockReportService.ipFeedbackReport).toHaveBeenCalledWith({query: searchTerm});
        });

    });

    describe('on paginate', function () {
        it('should call the service with page number', function () {
            deferredResult.resolve({});
            scope.$apply();

            scope.goToPage(2);
            scope.$digest();

            expect(mockReportService.ipFeedbackReport).toHaveBeenCalledWith({page: 2});
            expect(mockReportService.ipFeedbackReport.calls.count()).toEqual(2);
        });
    });

});
