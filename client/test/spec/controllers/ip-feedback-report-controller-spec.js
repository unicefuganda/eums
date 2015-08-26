describe('IpFeedbackReportController', function () {
    var scope, q, location, mockReportService, deferredResult, mockLoader;

    beforeEach(function () {
        module('IpFeedbackReport');

        mockReportService = jasmine.createSpyObj('mockReportService', ['ipFeedbackReport']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader']);

        inject(function ($controller, $q, $location, $rootScope) {
            deferredResult = $q.defer();
            scope = $rootScope.$new();
            location = $location;

            mockReportService.ipFeedbackReport.and.returnValue(deferredResult.promise);

            $controller('IpFeedbackReportController', {
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
            var response = {results:[{id: 3}, {id: 33}]};
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

            expect(mockReportService.ipFeedbackReport).toHaveBeenCalledWith({query: searchTerm});
            expect(mockReportService.ipFeedbackReport.calls.count()).toEqual(2);
        });

        it('should not call the service when search is spaces only', function () {
            deferredResult.resolve({});
            scope.$apply();

            scope.searchTerm = '      ';
            scope.$apply();

            expect(mockReportService.ipFeedbackReport.calls.count()).toEqual(1);
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
