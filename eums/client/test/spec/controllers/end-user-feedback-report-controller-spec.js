describe('EndUserFeedbackReportController', function () {
    var scope, location, mockReportService, deferredResult, mockLoader, timeout, initController;

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

            initController = function (route) {
                $controller('EndUserFeedbackReportController', {
                    $scope: scope,
                    $location: location,
                    ReportService: mockReportService,
                    LoaderService: mockLoader,
                    $routeParams: route
                });
            };
            initController({});

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

        it('should call reports service filter by location if required', function () {
            initController({district: 'Gulu'});

            var response = {results: [{id: 3}, {id: 33}]};
            deferredResult.resolve(response);
            scope.$apply();

            expect(mockReportService.endUserFeedbackReport).toHaveBeenCalledWith({'location': 'Gulu'});
            expect(scope.report).toEqual(response.results);
        });

        it('should set district', function () {
            expect(scope.district).toEqual('All Districts');
            initController({district: 'Fort Portal'});
            expect(scope.district).toEqual('Fort Portal');
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
