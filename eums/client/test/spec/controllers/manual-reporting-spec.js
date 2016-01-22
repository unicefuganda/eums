describe('ManualReportingController', function () {
    var scope, location, sorter, filter, timeout, q;
    var mockPurchaseOrderService, mockReleaseOrderService,
        mockLoaderService, mockSortService, mockSortArrowService;
    var deferred, deferredPurchaseOrder, deferredReleaseOrder,
        deferredSortResult, deferredSortArrowResult;
    var stubPurchaseOrders, stubReleaseOrders;
    var orderId = 1,
        salesOrderOneId = 1,
        programmeName = 'Test Programme';

    beforeEach(function () {
        module('ManualReporting');
        module('SysUtils');
        stubPurchaseOrders = [{
            id: 1,
            order_number: orderId,
            sales_order: salesOrderOneId,
            date: '2014-10-06',
            purchaseorderitem_set: [1, 2],
            programme: programmeName
        }];
        stubReleaseOrders = [{
            id: 1,
            order_number: orderId,
            delivery_date: '2014-10-06',
            description: 'Midwife Supplies',
            consignee: 1,
            waybill: 1,
            sales_order: 1,
            items: [1, 2],
            programme: programmeName
        }];
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['all', 'forDirectDelivery']);
        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['all']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader', 'showModal']);
        mockSortService = jasmine.createSpyObj('mockSortService', ['sortBy']);
        mockSortArrowService = jasmine.createSpyObj('mockSortArrowService', ['sortArrowClass', 'setSortArrow']);

        inject(function ($controller, $rootScope, $location, $q, $sorter, $filter, $httpBackend, $timeout, SysUtilsService) {
            q = $q;
            deferred = $q.defer();
            deferredPurchaseOrder = $q.defer();
            deferredReleaseOrder = $q.defer();
            deferredSortResult = $q.defer();
            deferredSortArrowResult = $q.defer();
            mockPurchaseOrderService.all.and.returnValue(deferredPurchaseOrder.promise);
            mockPurchaseOrderService.forDirectDelivery.and.returnValue(deferredPurchaseOrder.promise);
            mockReleaseOrderService.all.and.returnValue(deferredReleaseOrder.promise);
            mockSortService.sortBy.and.returnValue(deferredSortResult.promise);
            mockSortArrowService.sortArrowClass.and.returnValue(deferredSortArrowResult.promise);
            mockSortArrowService.setSortArrow.and.returnValue(deferredSortArrowResult.promise);

            timeout = $timeout;
            location = $location;
            scope = $rootScope.$new();
            sorter = $sorter;
            filter = $filter;

            spyOn(angular, 'element').and.callFake(function () {
                return {
                    modal: jasmine.createSpy('modal').and.callFake(function (status) {
                        return status;
                    })
                };
            });

            $controller('ManualReportingController',
                {
                    $scope: scope,
                    $location: location,
                    $timeout: timeout,
                    $sorter: sorter,
                    $filter: filter,
                    PurchaseOrderService: mockPurchaseOrderService,
                    ReleaseOrderService: mockReleaseOrderService,
                    LoaderService: mockLoaderService,
                    SortService: mockSortService,
                    SortArrowService: mockSortArrowService
                });
        });
    });

    describe('when initialized', function () {
        beforeEach(function () {
            deferredPurchaseOrder.resolve({results: stubPurchaseOrders, count: 1, pageSize: 10});
            deferredReleaseOrder.resolve({results: stubReleaseOrders, count: 1, pageSize: 10});
        });

        it('should set document on the scope', function () {
            scope.searchTerm = {};
            scope.$apply();
            expect(scope.documents).toEqual(stubPurchaseOrders);
        });

        it('should set document type on the scope', function () {
            var expectedDocumentType = 'PO';
            scope.$apply();
            expect(scope.currentDocumentType).toEqual(expectedDocumentType);
        });
    });

    describe('when document type is toggled', function () {
        beforeEach(function () {
            deferredPurchaseOrder.resolve({results: stubPurchaseOrders, count: 1, pageSize: 10});
            deferredReleaseOrder.resolve({results: stubReleaseOrders, count: 1, pageSize: 10});
        });

        it('should know to use the purchase orders if the document type selected is purchase orders', function () {
            scope.toggleDocumentType('PO');
            scope.$apply();
            expect(scope.documents).toEqual(stubPurchaseOrders);
        });

        it('should know to use the waybills if the document type selected is waybills', function () {
            scope.toggleDocumentType('RO');
            scope.$apply();
            expect(scope.documents).toEqual(stubReleaseOrders);
        });
    });

    describe('when select document', function () {
        it('should change the location to for purchase order document', function () {
            var document = {id: 1, doc_number: 1234, date: '2014-10-09', programme: 'Safe Water'};
            scope.toggleDocumentType('PO');
            scope.selectDocument(document);
            scope.$apply();
            expect(location.path()).toEqual('/field-verification-details/purchase-order/' + document.id);
        });

        it('should change the location to for waybill document', function () {
            var document = {id: 1, doc_number: 1234, date: '2014-10-09', programme: 'Safe Water'};
            scope.toggleDocumentType('RO');
            scope.selectDocument(document);
            scope.$apply();
            expect(location.path()).toEqual('/field-verification-details/waybill/' + document.id);
        });
    });

    describe('when document type changes', function () {
        it('should change the placeholder to have purchase order text', function () {
            var expectedPlaceHolderMessage = 'Search by purchase order number';
            scope.toggleDocumentType('PO');
            scope.$apply();
            expect(scope.placeHolderText).toEqual(expectedPlaceHolderMessage);
        });

        it('should change the placeholder to have waybill text', function () {
            var expectedPlaceHolderMessage = 'Search by waybill number';
            scope.toggleDocumentType('RO');
            scope.$apply();
            expect(scope.placeHolderText).toEqual(expectedPlaceHolderMessage);
        });
    });
});