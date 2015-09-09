describe('Warehouse Delivery Controller', function () {
    var scope, mockReleaseOrderService, location, deferredReleaseOrders, mockExportDeliveryService, mockToast, mockLoader,
        deferredExportResult;
    var releaseOrders = [{id: 1}, {id: 2}];

    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('WarehouseDelivery');

        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['all']);
        mockExportDeliveryService = jasmine.createSpyObj('mockExportDeliveryService', ['export']);
        mockToast = jasmine.createSpyObj('mockToast', ['create']);
        mockLoader = jasmine.createSpyObj('mockLoader', ['showLoader', 'hideLoader']);
        inject(function ($controller, $rootScope, $location, $q, $sorter) {
            deferredExportResult = $q.defer();
            deferredReleaseOrders = $q.defer();
            mockReleaseOrderService.all.and.returnValue(deferredReleaseOrders.promise);
            mockExportDeliveryService.export.and.returnValue(deferredExportResult.promise);
            scope = $rootScope.$new();
            location = $location;

            spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('WarehouseDeliveryController', {
                $scope: scope,
                $sorter: $sorter,
                $location: location,
                ngToast: mockToast,
                LoaderService: mockLoader,
                ReleaseOrderService: mockReleaseOrderService,
                ExportDeliveriesService: mockExportDeliveryService
            });
        });
    });

    it('should fetch release orders and put them on the scope.', function () {
        deferredReleaseOrders.resolve(releaseOrders);
        scope.initialize();
        scope.$apply();
        expect(mockReleaseOrderService.all).toHaveBeenCalled();
        expect(scope.releaseOrders).toEqual(releaseOrders);
    });

    it('should redirect to new warehouse delivery page when release order is selected', function () {
        var id = 39;
        scope.selectReleaseOrder(id);
        scope.$apply();
        expect(location.path()).toBe('/warehouse-delivery/new/' + id);
    });

    it('should call the export warehouse deliveries to csv', function () {

        scope.exportToCSV();
        expect(mockExportDeliveryService.export).toHaveBeenCalled();

    });

    it('should show toast with right message', function () {
        var message = 'Generating CSV, you will be notified via email once it is done.';
        deferredExportResult.resolve({data:{message: message}, status: 200});

        scope.exportToCSV();
        scope.$apply();
        expect(mockToast.create).toHaveBeenCalledWith({
            content: message,
            class: 'info'
        });
    });

    describe('on filter by date range', function () {
        it('should not filter when fromDate and toDate is empty', function () {
            scope.initialize();
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
        });

        it('should not filter when toDate is empty', function () {
            scope.initialize();
            scope.fromDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
        });

        it('should not filter when fromDate is empty', function () {
            scope.initialize();
            scope.toDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(1);
        });

        it('should filter deliveries when date range is given', function () {
            scope.initialize();
            scope.fromDate = '2014-05-07';
            scope.toDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(2);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, {from: '2014-05-07', to: '2014-07-07'});
        });

        it('should format dates before filtering deliveries ', function () {
            scope.initialize();
            scope.fromDate = 'Sun Aug 30 2015 00:00:00 GMT+0200 (SAST)';
            scope.toDate = 'Thu Sep 10 2015 00:00:00 GMT+0200 (SAST)';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(2);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, {from: '2015-08-30', to: '2015-09-10'});
        });

        it('should filter deliveries when date range is given with additional query', function () {
            scope.initialize();
            scope.query = 'wakiso programme';
            scope.fromDate = '2014-05-07';
            scope.toDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(2);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, {from: '2014-05-07', to: '2014-07-07', query: 'wakiso programme'})
        });

        it('should filter deliveries without date when fromDate is not given with additional query', function () {
            scope.initialize();
            scope.query = 'wakiso programme';
            scope.toDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(2);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, {query: 'wakiso programme'})
        });

        it('should not filter deliveries when toDate is not given with additional query', function () {
            scope.initialize();
            scope.query = 'wakiso programme';
            scope.fromDate = '2014-07-07';
            scope.$apply();

            expect(mockReleaseOrderService.all.calls.count()).toEqual(2);
            expect(mockReleaseOrderService.all).toHaveBeenCalledWith(undefined, {query: 'wakiso programme'})
        });
    });
});