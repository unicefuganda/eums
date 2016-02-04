describe('ItemFeedbackReportController', function () {
    var scope, location, mockReportService, deferredResult, mockLoader, timeout, initController, mockSystemSettingsService;
    var stubSettings = {
        'notification_message': 'notification',
        'district_label': 'district'
    };

    beforeEach(function () {
        module('ItemFeedbackReport');

        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader', 'showModal']);
        mockReportService = jasmine.createSpyObj('mockReportService', ['itemFeedbackReport']);
        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings', 'getSettingsWithDefault']);

        inject(function ($controller, $q, $location, $rootScope, $timeout) {
            deferredResult = $q.defer();
            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;

            mockReportService.itemFeedbackReport.and.returnValue(deferredResult.promise);
            mockSystemSettingsService.getSettings.and.returnValue($q.when(stubSettings));
            mockSystemSettingsService.getSettingsWithDefault.and.returnValue($q.when(stubSettings));

            initController = function (route) {
                $controller('ItemFeedbackReportController', {
                    $scope: scope,
                    $location: location,
                    $routeParams: route,
                    ReportService: mockReportService,
                    LoaderService: mockLoader,
                    SystemSettingsService: mockSystemSettingsService
                });
            };
            initController({});
        });
    });

    describe('on load', function () {
        it('should show the loader and hide it after the loading data', function () {
            deferredResult.resolve({results: [{}, {}]});
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

            expect(mockReportService.itemFeedbackReport).toHaveBeenCalled();
            expect(scope.report).toEqual(response.results)
        });

        it('should call reports service filter by location if required', function () {
            var response = {results: [{id: 3}, {id: 33}]};
            deferredResult.resolve(response);
            scope.$apply();

            expect(mockReportService.itemFeedbackReport).toHaveBeenCalledWith({
                field: 'dateOfReceipt',
                order: 'desc'
            }, 1);
            expect(scope.report).toEqual(response.results);
        });
    });

    describe('on click ip note remark icon', function () {
        it('should show modal ', function () {
            scope.$apply();
            scope.showAdditionalRemarks()
            expect(mockLoader.showModal).toHaveBeenCalledWith('additional-remarks-modal-dialog');
        });
    });


    describe('on filtering', function () {
        it('should call endpoint with search term after ', function () {
            scope.$apply();

            var searchTerm = {ip: 2};
            scope.searchTerm = searchTerm;
            scope.$apply();

            expect(mockReportService.itemFeedbackReport.calls.count()).toEqual(2);
            expect(mockReportService.itemFeedbackReport).toHaveBeenCalledWith({
                field: 'dateOfReceipt',
                order: 'desc',
                ip: 2
            }, 1);
        });

        it('should call endpoint when searchTerm district changes', function () {
            scope.searchTerm.selectedLocation = 'Adjumani';
            scope.$apply();

            expect(mockReportService.itemFeedbackReport).toHaveBeenCalledWith({
                field: 'dateOfReceipt',
                order: 'desc',
                selectedLocation: 'Adjumani'
            }, 1);
        });
    });

    describe('on paginate', function () {
        it('should call the service with page number', function () {
            deferredResult.resolve({results: [{}, {}]});
            scope.searchTerm = {};
            scope.$apply();

            scope.goToPage(2);
            scope.$digest();

            expect(mockReportService.itemFeedbackReport).toHaveBeenCalledWith({
                field: 'dateOfReceipt',
                order: 'desc'
            }, 2);
            expect(mockReportService.itemFeedbackReport.calls.count()).toEqual(2);
        });
    });
});
