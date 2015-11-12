describe('IpFeedbackReportByItemController', function () {
    var scope, location, mockReportService, deferredReportResult, mockLoader, timeout;

    beforeEach(function () {
        module('IpFeedbackReportByItem');

        mockReportService = jasmine.createSpyObj('mockReportService', ['ipFeedbackReport']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader', 'showModal']);

        inject(function ($controller, $q, $location, $rootScope, $timeout) {
            deferredReportResult = $q.defer();
            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;

            mockReportService.ipFeedbackReport.and.returnValue(deferredReportResult.promise);

            $controller('IpFeedbackReportByItemController', {
                $scope: scope,
                $location: location,
                ReportService: mockReportService,
                LoaderService: mockLoader
            });
;        });

        scope.directiveValues.allProgrammes = [];
    });

    describe('on load', function () {
        it('should show the loader and hide it after the loading data', function () {
            deferredReportResult.resolve([]);
            scope.$apply();

            expect(mockLoader.showLoader).toHaveBeenCalled();
            expect(mockLoader.showLoader.calls.count()).toEqual(1);

            expect(mockLoader.hideLoader).toHaveBeenCalled();
            expect(mockLoader.hideLoader.calls.count()).toEqual(1);
        });

        it('should call reports service', function () {
            var response = {results: [{id: 3}, {id: 33}]};
            deferredReportResult.resolve(response);
            scope.$apply();

            expect(mockReportService.ipFeedbackReport).toHaveBeenCalled();
            expect(scope.report).toEqual(response.results)
        });

        it('should load all programmes when result has all programmes', function () {
            deferredReportResult.resolve({programmeIds: [5, 6]});
            scope.directiveValues.allProgrammes = [{id: 5}, {id: 6}];

            scope.$apply();

            expect(scope.displayProgrammes).toEqual([{id: 5}, {id: 6}]);
        });

        it('should just load programmes that match programme ids in result', function() {
            deferredReportResult.resolve({programmeIds: [3, 4]});
            scope.directiveValues.allProgrammes = [{id: 2}, {id: 3}, {id: 4}, {id: 5}];

            scope.$apply();

            expect(scope.displayProgrammes).toEqual([{id: 3}, {id: 4}]);
        });
    });

    describe('on filtering', function () {
        it('should call endpoint with query params after ', function () {
            deferredReportResult.resolve({results: []});
            scope.$apply();

            var searchTerm = 'something';
            scope.searchTerm = {query: searchTerm};
            scope.$apply();

            timeout.flush();
            expect(mockReportService.ipFeedbackReport.calls.count()).toEqual(2);
            expect(mockReportService.ipFeedbackReport).toHaveBeenCalledWith({query: searchTerm}, 1);
        });

        it('should call endpoint when searchTerm programme_id changes', function () {
            deferredReportResult.resolve({results: []});
            scope.$apply();

            var programme_id = 2;
            scope.searchTerm = {programme_id: programme_id};
            scope.$apply();

            timeout.flush();
            expect(mockReportService.ipFeedbackReport.calls.count()).toEqual(2);
            expect(mockReportService.ipFeedbackReport).toHaveBeenCalledWith({programme_id: programme_id}, 1);
        });

    });

    describe('on paginate', function () {
        it('should call the service with page number', function () {
            deferredReportResult.resolve({});
            scope.$apply();

            scope.goToPage(2);

            scope.$digest();
            timeout.flush();

            expect(mockReportService.ipFeedbackReport).toHaveBeenCalledWith({}, 2);
            expect(mockReportService.ipFeedbackReport.calls.count()).toEqual(2);
        });
    });

    describe('on show remark', function () {
        it('should call show modal with right index', function () {
            scope.showRemarks(4);
            expect(mockLoader.showModal).toHaveBeenCalledWith('remarks-modal-4');
        })
    })

});
