describe('IpFeedbackReportController', function () {
    var scope, location, mockReportService, deferredResult, mockLoader, timeout;

    beforeEach(function () {
        module('IpFeedbackReportByDelivery');

        mockReportService = jasmine.createSpyObj('mockReportService', ['ipFeedbackReportByDelivery']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader', 'showModal']);

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

    describe('on paginate', function () {
        it('should call the service with page number', function () {
            deferredResult.resolve({});
            scope.$apply();

            scope.goToPage(2);
            scope.$digest();

            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalledWith({page: 2});
            expect(mockReportService.ipFeedbackReportByDelivery.calls.count()).toEqual(2);
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
            expect(mockReportService.ipFeedbackReportByDelivery.calls.count()).toEqual(2);
            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalledWith({query: searchTerm});
        });

    });

    describe('on show remark', function(){
        it('should call show modal with right index', function(){
            scope.showRemarks(3);

            expect(mockLoader.showModal).toHaveBeenCalledWith('remarks-modal-3');
        })
    })

});
