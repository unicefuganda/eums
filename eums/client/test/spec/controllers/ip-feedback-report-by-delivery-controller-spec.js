describe('IpFeedbackReportController', function () {
    var scope, location, mockReportService, deferredResult, mockLoader, timeout,
        route = {}, initController, mockEumsErrorMessageService, mockContactService, mockSystemSettingsService;
    var stubSettings = {
        'notification_message': 'notification',
        'district_label': 'district'
    };

    beforeEach(function () {
        module('IpFeedbackReportByDelivery');

        mockReportService = jasmine.createSpyObj('mockReportService', ['ipFeedbackReportByDelivery']);
        mockContactService = jasmine.createSpyObj('mockContactService', ['ContactService']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader', 'showModal']);
        mockEumsErrorMessageService = jasmine.createSpyObj('mockEumsErrorMessageService', ['showError']);
        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings', 'getSettingsWithDefault']);

        inject(function ($controller, $q, $location, $rootScope, $timeout) {
            deferredResult = $q.defer();

            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;
            mockReportService.ipFeedbackReportByDelivery.and.returnValue(deferredResult.promise);
            mockSystemSettingsService.getSettings.and.returnValue($q.when(stubSettings));
            mockSystemSettingsService.getSettingsWithDefault.and.returnValue($q.when(stubSettings));

            initController = function (routeParams) {
                $controller('IpFeedbackReportByDeliveryController', {
                    $scope: scope,
                    $location: location,
                    $routeParams: routeParams,
                    ReportService: mockReportService,
                    ContactService: mockContactService,
                    LoaderService: mockLoader,
                    SystemSettingsService: mockSystemSettingsService,
                    ErrorMessageService: mockEumsErrorMessageService
                });
            };

            initController(route);
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
            var response = {results: [{id: 4}, {id: 24}]};
            deferredResult.resolve(response);
            scope.$apply();

            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalled();
            expect(scope.report).toEqual(response.results)
        });

        it('should filter reports service by district if requested', function () {
            var response = {results: [{id: 4}, {id: 24}]};
            deferredResult.resolve(response);
            scope.$apply();

            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalledWith({
                field: 'shipmentDate',
                order: 'desc'
            }, 1);
            expect(scope.report).toEqual(response.results)
        });
    });

    describe('on paginate', function () {
        it('should call the service with page number', function () {
            deferredResult.resolve({results: [{}, {}]});
            scope.$apply();

            scope.goToPage(2);
            scope.$digest();

            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalledWith({
                field: 'shipmentDate',
                order: 'desc'
            }, 2);
            expect(mockReportService.ipFeedbackReportByDelivery.calls.count()).toEqual(2);
        });
    });

    describe('on filtering', function () {
        it('should call endpoint with query params after ', function () {
            deferredResult.resolve({results: []});
            scope.$apply();

            var searchTerm = 'something';
            scope.searchTerm = {poWaybill: searchTerm};
            scope.$apply();

            timeout.flush();
            expect(mockReportService.ipFeedbackReportByDelivery.calls.count()).toEqual(2);
            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalledWith({
                field: 'shipmentDate',
                order: 'desc'
            }, 1);
        });

        it('should call endpoint when searchTerm programme_id changes', function () {
            deferredResult.resolve({results: []});
            scope.$apply();

            var programme_id = 2;
            scope.searchTerm = {programme_id: programme_id};
            scope.$apply();

            expect(mockReportService.ipFeedbackReportByDelivery.calls.count()).toEqual(2);
            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalledWith({
                field: 'shipmentDate',
                order: 'desc',
                programme_id: 2
            }, 1);
        });

        it('should call endpoint when searchTerm district changes', function () {
            scope.searchTerm.selectedLocation = 'Adjumani';
            scope.$apply();

            expect(mockReportService.ipFeedbackReportByDelivery).toHaveBeenCalledWith({
                field: 'shipmentDate',
                order: 'desc',
                selectedLocation: 'Adjumani'
            }, 1);
        });
    });

    describe('on show remark', function () {
        it('should call show modal with right index', function () {
            scope.showRemarks(3);

            expect(mockLoader.showModal).toHaveBeenCalledWith('remarks-modal-3');
        })
    });

    describe('on loss of connection', function () {
        it('should show an error message', function () {
            deferredResult.reject();
            scope.$apply();

            expect(mockEumsErrorMessageService.showError).toHaveBeenCalled();
        });
    });

    describe('on sorting', function () {
        it('should sort by shipment date desc', function () {
            scope.sortBy("shipmentDate");

            expect(scope.sortTerm).toEqual({field: 'shipmentDate', order: 'asc'});
        });

        it('should sort by shipment date asc', function () {
            scope.sortBy("shipmentDate");

            expect(scope.sortTerm).toEqual({field: 'shipmentDate', order: 'asc'});
        });

        it('should sort by shipment date', function () {
            scope.sortBy("shipmentDate");
            scope.sortBy("shipmentDate");

            expect(scope.sortTerm).toEqual({});
        });

        it('should sort when sort field changed', function () {
            scope.sortBy("shipmentDate");
            scope.sortBy("dateOfReceipt");

            expect(scope.sortTerm).toEqual({field: 'dateOfReceipt', order: 'desc'});
        });

        it('should sort as default when field is not supported', function () {
            scope.sortBy("notSupported");
            expect(scope.sortTerm).toEqual({field: 'shipmentDate', order: 'desc'});
        });
    });
});
