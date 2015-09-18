describe('EndUserFeedbackReportController', function () {
    var scope, location, mockReportService, deferredResult, mockLoader, timeout;

    beforeEach(function () {
        module('EndUserFeedbackReport');

        mockReportService = jasmine.createSpyObj('mockReportService', ['endUserFeedbackReport']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader']);

        inject(function ($controller, $q, $location, $rootScope, $timeout) {
            deferredResult = $q.defer();
            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;

            mockReportService.endUserFeedbackReport.and.returnValue(deferredResult.promise);

            $controller('EndUserFeedbackReportController', {
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

            expect(mockReportService.endUserFeedbackReport).toHaveBeenCalled();
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
            expect(mockReportService.endUserFeedbackReport.calls.count()).toEqual(2);
            expect(mockReportService.endUserFeedbackReport).toHaveBeenCalledWith({query: searchTerm});
        });

    });

    describe('on paginate', function () {
        it('should call the service with page number', function () {
            deferredResult.resolve({});
            scope.$apply();

            scope.goToPage(2);
            scope.$digest();

            expect(mockReportService.endUserFeedbackReport).toHaveBeenCalledWith({page: 2});
            expect(mockReportService.endUserFeedbackReport.calls.count()).toEqual(2);
        });
    });

});
