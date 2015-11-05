describe('DirectDeliveryController', function () {

    var scope, sorter, filter;
    var location, distPlanEndpointUrl;
    var mockContactService, mockProgrammeService, mockPurchaseOrderService, mockLoaderService;
    var deferred, deferredPlan, deferredPurchaseOrder, mockExportDeliveryService, mockToast,
        deferredExportResult, timeout;

    var programmeOne = {
        id: 1, name: 'Test Programme'
    };

    var purchaseOrderOne = {
        id: 1,
        'order_number': '00001',
        'date': '2014-10-02',
        programme: programmeOne.id,
        description: 'sale',
        hasPlan: 'true'
    };
    var purchaseOrderDetails = [purchaseOrderOne];

    beforeEach(function () {
        module('DirectDelivery');
        mockContactService = jasmine.createSpyObj('mockContactService', ['create']);
        mockProgrammeService = jasmine.createSpyObj('mockProgrammeService', ['get', 'all']);
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['all', 'forDirectDelivery']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader', 'showModal']);
        mockExportDeliveryService = jasmine.createSpyObj('mockExportDeliveryService', ['export']);
        mockToast = jasmine.createSpyObj('mockToast', ['create']);

        inject(function ($controller, $rootScope, ContactService, $location, $q, $sorter, $filter, $httpBackend, EumsConfig, $timeout) {
            deferred = $q.defer();
            deferredPlan = $q.defer();
            deferredPurchaseOrder = $q.defer();
            deferredExportResult = $q.defer();
            mockContactService.create.and.returnValue(deferred.promise);
            mockProgrammeService.get.and.returnValue(deferred.promise);
            mockProgrammeService.all.and.returnValue(deferred.promise);
            mockPurchaseOrderService.all.and.returnValue(deferredPurchaseOrder.promise);
            mockPurchaseOrderService.forDirectDelivery.and.returnValue(deferredPurchaseOrder.promise);
            mockExportDeliveryService.export.and.returnValue(deferredExportResult.promise);

            timeout = $timeout;

            location = $location;
            scope = $rootScope.$new();
            sorter = $sorter;
            filter = $filter;
            distPlanEndpointUrl = EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN;

            $controller('DirectDeliveryController',
                {
                    $scope: scope, ContactService: mockContactService,
                    ProgrammeService: mockProgrammeService,
                    PurchaseOrderService: mockPurchaseOrderService,
                    $sorter: sorter,
                    $filter: filter,
                    $location: location,
                    LoaderService: mockLoaderService,
                    ExportDeliveriesService: mockExportDeliveryService,
                    ngToast: mockToast,
                    $timeout: timeout
                });
        });
    });

    describe('when sorted', function () {
        it('should set the sort criteria', function () {
            scope.sortBy('field');
            expect(scope.sort.criteria).toBe('field');
        });
        it('should set the sort order as descending by default', function () {
            scope.sortBy('field');
            expect(scope.sort.descending).toBe(true);
        });
        it('should toggle the sort order', function () {
            scope.sortBy('field');
            scope.sortBy('field');
            expect(scope.sort.descending).toBe(false);
        });
    });

    describe('when initialized', function () {
        xit('should set all sales orders on initialize to the scope', function () {
            deferredPurchaseOrder.resolve(purchaseOrderDetails);
            scope.initialize();
            scope.$apply();
            expect(scope.salesOrders).toEqual(purchaseOrderDetails);
        });

        it('should set the sorter', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortBy).toBe(sorter);
        });

        it('should sort by order number', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sort.criteria).toBe('orderNumber');
        });

        it('should sort in descending order', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sort.descending).toBe(false);
        });

        it('should have the sort arrow icon on the order number column by default', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortArrowClass('')).toEqual('');
        });

        it('should set the clicked column as active', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortArrowClass('orderNumber')).toEqual('active glyphicon glyphicon-arrow-down');
        });

        it('should set the clicked column as active and have the up arrow when ascending', function () {
            scope.initialize();
            scope.sort.descending = true;
            scope.$apply();
            expect(scope.sortArrowClass('orderNumber')).toEqual('active glyphicon glyphicon-arrow-up');
        });

        it('should show loader', function () {
            scope.initialize();
            scope.$apply();
            expect(mockLoaderService.showLoader).toHaveBeenCalled();
            expect(mockLoaderService.hideLoader).not.toHaveBeenCalled();
        });

        it('should hide loader after retrieving purchase orders', function () {
            deferredPurchaseOrder.resolve({results: ['po one', 'po two'], count: 2, pageSize: 10});
            scope.initialize();
            scope.$apply();
            expect(mockLoaderService.hideLoader).toHaveBeenCalled();
        });
    });

    describe('when purchase order selected', function () {
        it('should show modal', function () {
            scope.selectPurchaseOrder(purchaseOrderOne);
            expect(mockLoaderService.showModal).toHaveBeenCalledWith('select-modal-1');
        });

        it('should route to single ip when single ip is selected', function () {
            scope.showSingleIpMode(purchaseOrderOne);
            scope.$apply();
            expect(location.path()).toBe('/direct-delivery/new/1/single');
        });

        it('should route to multiple ip when multiple ip is selected', function () {
            scope.showMultipleIpMode(purchaseOrderOne);
            scope.$apply();
            expect(location.path()).toBe('/direct-delivery/new/1/multiple');
        });

        it('should not show modal if purchase order is multiple and redirect', function(){
            purchaseOrderOne.isSingleIp = false;
            scope.selectPurchaseOrder(purchaseOrderOne);
            expect(mockLoaderService.showModal).not.toHaveBeenCalled();
            expect(location.path()).toBe('/direct-delivery/new/1/multiple');

        });

        it('should not show modal if purchase order is multiple and redirect', function(){
            purchaseOrderOne.isSingleIp = true;
            scope.selectPurchaseOrder(purchaseOrderOne);
            expect(mockLoaderService.showModal).not.toHaveBeenCalled();
            expect(location.path()).toBe('/direct-delivery/new/1/single');

        })
    });

    describe('when filtered by date range', function () {
        it('should not filter empty when query, fromDate and toDate are empty', function () {
            scope.$apply();

            expect(mockPurchaseOrderService.forDirectDelivery.calls.count()).toEqual(0);
        });

        it('should filter fromDate when toDate is empty', function () {
            scope.$apply();
            scope.fromDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({ from: '2014-07-07' }));
        });

        it('should filter toDate when fromDate is empty', function () {
            scope.$apply();
            scope.toDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({ to: '2014-07-07' }));
        });

        it('should filter deliveries when date range is given', function () {
            scope.$apply();
            scope.fromDate = '2014-05-07';
            scope.toDate = '2014-07-07';
            scope.$apply();
            timeout.flush();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({ from: '2014-05-07', to: '2014-07-07' }));
        });

        it('should format dates before filtering deliveries ', function () {
            scope.$apply();
            scope.fromDate = 'Sun Aug 30 2015 00:00:00 GMT+0200 (SAST)';
            scope.toDate = 'Thu Sep 10 2015 00:00:00 GMT+0200 (SAST)';
            scope.$apply();
            timeout.flush();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({ from: '2015-08-30', to: '2015-09-10' }));
        });

        it('should filter deliveries when date range is given with additional query', function () {
            scope.$apply();
            scope.query = 'wakiso programme';
            scope.fromDate = '2014-05-07';
            scope.$apply();
            timeout.flush();

            expect(mockPurchaseOrderService.forDirectDelivery).toHaveBeenCalledWith(undefined, jasmine.objectContaining({ from: '2014-05-07', query: 'wakiso programme' }))
        });
    });

    describe('export to CSV', function () {

        it('should call the export direct deliveries to csv', function () {
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