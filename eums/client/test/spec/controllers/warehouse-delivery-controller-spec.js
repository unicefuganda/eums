describe('Warehouse Delivery Controller', function () {
    var scope, mockReleaseOrderService, location, deferredReleaseOrders, deferredSystemSettings, deferredSortResult,
        deferredSortArrowResult, mockExportDeliveryService, mockToast, mockLoader, deferredExportResult, timeout,
        mockSystemSettingsService, mockSortService, mockSortArrowService;

    var releaseOrders = {
        'count': 2,
        'pageSize': 1,
        'results': [{id: 1}, {id: 2}]
    };

    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('WarehouseDelivery');

        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['all']);
        mockExportDeliveryService = jasmine.createSpyObj('mockExportDeliveryService', ['export']);
        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings']);
        mockSortService = jasmine.createSpyObj('mockSortService', ['sortBy']);
        mockSortArrowService = jasmine.createSpyObj('mockSortArrowService', ['sortArrowClass']);
        mockToast = jasmine.createSpyObj('mockToast', ['create']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader']);
        inject(function ($controller, $rootScope, $location, $q, $sorter, $timeout) {
            deferredExportResult = $q.defer();
            deferredReleaseOrders = $q.defer();
            deferredSystemSettings = $q.defer();
            deferredSortResult = $q.defer();
            deferredSortArrowResult = $q.defer();
            mockSystemSettingsService.getSettings.and.returnValue(deferredSystemSettings.promise);
            mockReleaseOrderService.all.and.returnValue(deferredReleaseOrders.promise);
            mockExportDeliveryService.export.and.returnValue(deferredExportResult.promise);
            mockSortService.sortBy.and.returnValue(deferredSortResult.promise);
            mockSortArrowService.sortArrowClass.and.returnValue(deferredSortArrowResult.promise);
            scope = $rootScope.$new();
            location = $location;
            timeout = $timeout;

            spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('WarehouseDeliveryController', {
                $scope: scope,
                $sorter: $sorter,
                $location: location,
                ngToast: mockToast,
                LoaderService: mockLoader,
                ReleaseOrderService: mockReleaseOrderService,
                ExportDeliveriesService: mockExportDeliveryService,
                SystemSettingsService: mockSystemSettingsService,
                SortService: mockSortService,
                SortArrowService: mockSortArrowService,
                $timeout: timeout
            });
        });
    });

    describe('when initialized', function () {
        it('should fetch release orders and put them on the scope.', function () {
            deferredReleaseOrders.resolve(releaseOrders);
            scope.initialize();
            scope.$apply();
            expect(mockReleaseOrderService.all).toHaveBeenCalled();
            expect(scope.releaseOrders).toEqual(releaseOrders.results);
        });

        it('should redirect to new warehouse delivery page when release order is selected', function () {
            var id = 39;
            scope.selectReleaseOrder(id);
            scope.$apply();
            expect(location.path()).toBe('/warehouse-delivery/new/' + id);
        });
    });

    describe('exporter to exporter', function () {
        it('should call the exporter warehouse deliveries to exporter', function () {

            scope.exportToCSV();
            expect(mockExportDeliveryService.export).toHaveBeenCalledWith('warehouse');

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

    describe('when filtered by last shipment date range', function () {
        it('should not filter when fromDate and toDate is empty', function () {
            scope.searchTerm = {};
            scope.$apply();
            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
        });

        it('should filter when toDate is empty', function () {
            scope.searchTerm.fromDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                fromDate: '2014-07-07',
            }));
        });

        it('should still filter when fromDate is empty', function () {
            scope.searchTerm.toDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                toDate: '2014-07-07',
            }));
        });

        it('should filter deliveries when date range is given', function () {
            scope.searchTerm.fromDate = '2014-05-07';
            scope.searchTerm.toDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                fromDate: '2014-05-07',
                toDate: '2014-07-07',
            }));
        });

        it('should format dates before filtering deliveries ', function () {
            scope.searchTerm.fromDate = 'Sun Aug 30 2015 00:00:00 GMT+0200 (SAST)';
            scope.searchTerm.toDate = 'Thu Sep 10 2015 00:00:00 GMT+0200 (SAST)';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                fromDate: '2015-08-30',
                toDate: '2015-09-10',
            }));
        });

        it('should filter deliveries when date range is given with additional query', function () {
            scope.searchTerm.purchaseOrder = 'wakiso programme';
            scope.searchTerm.fromDate = '2014-05-07';
            scope.searchTerm.toDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: 'wakiso programme',
                fromDate: '2014-05-07',
                toDate: '2014-07-07',
            }));
        });

        it('should filter deliveries when fromDate is not given with additional query', function () {
            scope.searchTerm.purchaseOrder = 'wakiso programme';
            scope.searchTerm.toDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: 'wakiso programme',
                toDate: '2014-07-07',
            }));
        });

        it('should filter deliveries when toDate is not given with additional query', function () {
            scope.searchTerm.purchaseOrder = 'wakiso programme';
            scope.searchTerm.fromDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: 'wakiso programme',
                fromDate: '2014-07-07',
            }));
        });
    });

    describe('when filtered by other fields', function () {
        it('should perform filtering when waybill number is given', function () {
            scope.searchTerm.purchaseOrder = '00001';
            scope.$apply();

            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: '00001',
            }));
        });

        it('should perform filtering when item description is given', function () {
            scope.searchTerm.itemDescription = 'Leaflet 2013';
            scope.$apply();

            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                itemDescription: 'Leaflet 2013',
            }));
        });

        it('should perform filtering when outcome/programme is selected', function () {
            scope.searchTerm.programmeId = '5';
            scope.$apply();

            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                programmeId: '5',
            }));
        });

        it('should perform filtering when district is selected', function () {
            scope.searchTerm.selectedLocation = 'Adjumani';
            scope.$apply();

            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                selectedLocation: 'Adjumani',
            }));
        });

        it('should perform filtering when IP is selected', function () {
            scope.searchTerm.ipId = '3';
            scope.$apply();

            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
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

            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
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
            scope.$apply()
            timeout.flush();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(2);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, jasmine.objectContaining({
                purchaseOrder: 'wakiso programme',
                fromDate: '2014-07-07',
            }));
        });
    })
});