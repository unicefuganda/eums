describe('Warehouse Delivery Controller', function () {
    var scope, mockReleaseOrderService, location, deferredReleaseOrders, mockExportDeliveryService, mockToast,
        deferredExportResult;
    var releaseOrders = [{id: 1}, {id: 2}];

    var fakeElement = {
        modal: function () {
        }
    };

    beforeEach(function () {
        module('WarehouseDelivery');

        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['all']);
        mockExportDeliveryService = jasmine.createSpyObj('mockExportDeliveryService', ['all']);
        mockToast = jasmine.createSpyObj('mockToast', ['create']);
        inject(function ($controller, $rootScope, $location, $q, $sorter) {
            deferredExportResult = $q.defer();
            deferredReleaseOrders = $q.defer();
            mockReleaseOrderService.all.and.returnValue(deferredReleaseOrders.promise);
            mockExportDeliveryService.all.and.returnValue(deferredExportResult.promise);
            scope = $rootScope.$new();
            location = $location;

            spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('WarehouseDeliveryController', {
                $scope: scope,
                $sorter: $sorter,
                $location: location,
                ngToast: mockToast,
                ReleaseOrderService: mockReleaseOrderService,
                ExportDeliveryService: mockExportDeliveryService
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
        expect(mockExportDeliveryService.all
        ).toHaveBeenCalled();

    });

    it('should show toast with right message', function () {
        var message = 'Generating CSV, you will be notified via email once it is done.';
        deferredExportResult.resolve({message: message, status: 200});

        scope.exportToCSV();
        scope.$apply();
        expect(mockToast.create).toHaveBeenCalledWith({
            content: message,
            class: 'success'
        });
    });
});