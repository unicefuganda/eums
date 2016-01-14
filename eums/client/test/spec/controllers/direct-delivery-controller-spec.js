describe('DirectDeliveryController', function () {

    var scope, sorter, filter;
    var location, distPlanEndpointUrl;
    var mockContactService, mockProgrammeService, mockPurchaseOrderService,
        mockLoaderService, mockSortService, mockSortArrowService;
    var deferred, deferredPlan, deferredPurchaseOrder, mockExportDeliveryService, mockToast,
        deferredSortResult, deferredSortArrowResult, deferredExportResult, timeout;

    var programmeOne = {
        id: 1,
        name: 'Test Programme'
    };
    var stubPurchaseOrderOne = {
        id: 1,
        'order_number': '00001',
        'date': '2014-10-02',
        programme: programmeOne.id,
        description: 'sale',
        hasPlan: 'true'
    };
    var stubPurchaseOrders = [stubPurchaseOrderOne];

    beforeEach(function () {
        module('DirectDelivery');
        module('SysUtils');
        mockContactService = jasmine.createSpyObj('mockContactService', ['create']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['get', 'all']);
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['all', 'forDirectDelivery']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader', 'showModal']);
        mockExportDeliveryService = jasmine.createSpyObj('mockExportDeliveryService', ['export']);
        mockSortService = jasmine.createSpyObj('mockSortService', ['sortBy']);
        mockSortArrowService = jasmine.createSpyObj('mockSortArrowService', ['sortArrowClass']);
        mockToast = jasmine.createSpyObj('mockToast', ['create']);

        inject(function ($controller, $rootScope, ContactService, $location, $q, $sorter, $filter, $httpBackend,
                         EumsConfig, SysUtilsService, $timeout) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredPurchaseOrder = $q.defer();
            deferredExportResult = $q.defer();
            deferredSortResult = $q.defer();
            deferredSortArrowResult = $q.defer();
            mockContactService.create.and.returnValue(deferred.promise);
            mockProgrammeService.get.and.returnValue(deferred.promise);
            mockProgrammeService.all.and.returnValue(deferred.promise);
            mockPurchaseOrderService.all.and.returnValue(deferredPurchaseOrder.promise);
            mockPurchaseOrderService.forDirectDelivery.and.returnValue(deferredPurchaseOrder.promise);
            mockExportDeliveryService.export.and.returnValue(deferredExportResult.promise);
            mockSortService.sortBy.and.returnValue(deferredSortResult.promise);
            mockSortArrowService.sortArrowClass.and.returnValue(deferredSortArrowResult.promise);

            timeout = $timeout;
            location = $location;
            scope = $rootScope.$new();
            sorter = $sorter;
            filter = $filter;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            $controller('DirectDeliveryController',
                {
                    $scope: scope,
                    ContactService: mockContactService,
                    ProgrammeService: mockProgrammeService,
                    PurchaseOrderService: mockPurchaseOrderService,
                    $sorter: sorter,
                    $filter: filter,
                    $location: location,
                    LoaderService: mockLoaderService,
                    ExportDeliveriesService: mockExportDeliveryService,
                    ngToast: mockToast,
                    $timeout: timeout,
                    SortService: mockSortService,
                    SortArrowService: mockSortArrowService,
                });
        });
    });

    describe('when initialized', function () {
        it('should set all sales orders on initialize to the scope', function () {
            deferredPurchaseOrder.resolve({results: stubPurchaseOrders, count: 2, pageSize: 10});
            scope.searchTerm = {};
            scope.$apply();

            expect(scope.purchaseOrders).toEqual(stubPurchaseOrders);
        });

        it('should show loader', function () {
            scope.$apply();

            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader).not.toHaveBeenCalled();
        });

        it('should hide loader after retrieving purchase orders', function () {
            deferredPurchaseOrder.resolve({results: ['po one', 'po two'], count: 2, pageSize: 10});
            scope.$apply();

            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
        });
    });

    describe('when purchase order selected', function () {
        it('should show modal', function () {
            scope.selectPurchaseOrder(stubPurchaseOrderOne);

            expect(mockLoaderService.showModal).toHaveBeenCalledWith('select-modal-1');
        });

        it('should route to single ip when single ip is selected', function () {
            scope.showSingleIpMode(stubPurchaseOrderOne);
            scope.$apply();

            expect(location.path()).toBe('/direct-delivery/new/1/single');
        });

        it('should route to multiple ip when multiple ip is selected', function () {
            scope.showMultipleIpMode(stubPurchaseOrderOne);
            scope.$apply();

            expect(location.path()).toBe('/direct-delivery/new/1/multiple');
        });

        it('should not show modal if purchase order is multiple and redirect', function () {
            stubPurchaseOrderOne.isSingleIp = false;
            scope.selectPurchaseOrder(stubPurchaseOrderOne);

            expect(mockLoaderService.showModal).not.toHaveBeenCalled();
            expect(location.path()).toBe('/direct-delivery/new/1/multiple');

        });

        it('should not show modal if purchase order is multiple and redirect', function () {
            stubPurchaseOrderOne.isSingleIp = true;
            scope.selectPurchaseOrder(stubPurchaseOrderOne);

            expect(mockLoaderService.showModal).not.toHaveBeenCalled();
            expect(location.path()).toBe('/direct-delivery/new/1/single');
        })
    });

    describe('when filtered by last shipment date range', function () {
        it('should perform filtering while fromDate and toDate are empty', function () {
            scope.searchTerm = {};
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery.calls.count()).toEqual(1);
        });

        it('should perform filtering with fromDate while toDate is empty', function () {
            scope.searchTerm.fromDate = '2014-07-07';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({fromDate: '2014-07-07'}));
        });

        it('should perform filtering with toDate while fromDate is empty', function () {
            scope.searchTerm.toDate = '2014-07-07';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({toDate: '2014-07-07'}));
        });

        it('should perform filtering when the date range is given', function () {
            scope.searchTerm.fromDate = '2014-05-07';
            scope.searchTerm.toDate = '2014-07-07';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                fromDate: '2014-05-07',
                toDate: '2014-07-07'
            }));
        });

        it('should format dates before filtering', function () {
            scope.searchTerm.fromDate = 'Sun Aug 30 2015 00:00:00 GMT+0200 (SAST)';
            scope.searchTerm.toDate = 'Thu Sep 10 2015 00:00:00 GMT+0200 (SAST)';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                fromDate: '2015-08-30',
                toDate: '2015-09-10'
            }));
        });

        it('should filter deliveries when date range is given with additional query', function () {
            scope.searchTerm.purchaseOrder = 'wakiso';
            scope.$apply();
            scope.searchTerm.fromDate = '2014-05-07';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: 'wakiso',
                fromDate: '2014-05-07',
            }))
        });
    });

    describe('when filtered by other fields', function () {
        it('should perform filtering when purchase order is given', function () {
            scope.searchTerm.purchaseOrder = '00001';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: '00001',
            }));
        });

        it('should perform filtering when item description is given', function () {
            scope.searchTerm.itemDescription = 'Leaflet 2013';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                itemDescription: 'Leaflet 2013',
            }));
        });

        it('should perform filtering when outcome/programme is selected', function () {
            scope.searchTerm.programmeId = '5';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                programmeId: '5',
            }));
        });

        it('should perform filtering when district is selected', function () {
            scope.searchTerm.selectedLocation = 'Adjumani';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                selectedLocation: 'Adjumani',
            }));
        });

        it('should perform filtering when IP is selected', function () {
            scope.searchTerm.ipId = '3';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                ipId: '3',
            }));
        });

        it('should perform filtering when multi-fields are specified', function () {
            scope.searchTerm.purchaseOrder = '00001';
            scope.searchTerm.itemDescription = 'Leaflet 2013';
            scope.searchTerm.fromDate = '2014-05-07';
            scope.searchTerm.toDate = '2014-07-07';
            scope.searchTerm.programmeId = '5';
            scope.searchTerm.selectedLocation = 'Adjumani';
            scope.searchTerm.ipId = '3';
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: '00001',
                itemDescription: 'Leaflet 2013',
                fromDate: '2014-05-07',
                toDate: '2014-07-07',
                programmeId: '5',
                selectedLocation: 'Adjumani',
                ipId: '3',
            }));
        });

        it('should perform filtering while timer has been initialized', function () {
            scope.searchTerm = {};
            scope.$apply();
            scope.searchTerm.purchaseOrder = 'wakiso programme';
            scope.searchTerm.fromDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            expect(mockPurchaseOrderService.forDirectDelivery.calls.count()).toEqual(2);
            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: 'wakiso programme',
                fromDate: '2014-07-07',
            }));
        });
    });

    describe('exporter to CSV', function () {
        it('should call the exporter direct deliveries to exporter', function () {
            scope.exportToCSV();
            expect(mockExportDeliveryService.export).toHaveBeenCalledWith('direct');

        });

        it('should show toast with success message', function () {
            var message = 'Generating CSV, you will be notified via email once it is done.';
            deferredExportResult.resolve({data: {message: message}, status: 200});

            scope.exportToCSV();
            scope.$apply();
            expect(mockToast.create).toHaveBeenCalledWith({
                content: message,
                class: 'info'
            });
        });

        it('should show toast with error message', function () {
            deferredExportResult.reject({status: 500});

            scope.exportToCSV();
            scope.$apply();
            expect(mockToast.create).toHaveBeenCalledWith({
                content: "Error while generating CSV. Please contact the system's admin.",
                class: 'danger'
            });
        });
    });
});