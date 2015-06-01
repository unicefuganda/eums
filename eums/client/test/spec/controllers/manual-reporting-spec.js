describe('ManualReportingController', function () {
    var location, scope, sorter, timeout, q;
    var  mockPurchaseOrderService, mockReleaseOrderService;
    var deferred, deferredPurchaseOrderPromise, deferredReleaseOrderPromise;
    var stubPurchaseOrders, stubReleaseOrders;
    var orderId = 1,
        salesOrderOneId = 1,
        programmeName = 'Test Programme';

    beforeEach(module('ManualReporting'));

    beforeEach(function () {
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
            releaseorderitem_set: [1, 2],
            programme: programmeName
        }];

        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['all']);
        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['all']);

        inject(function ($controller, $rootScope, $location, $sorter, $timeout, $q) {
            q = $q;
            deferred = $q.defer();
            deferredPurchaseOrderPromise = $q.defer();
            deferredReleaseOrderPromise = $q.defer();
            mockPurchaseOrderService.all.and.returnValue(deferredPurchaseOrderPromise.promise);
            mockReleaseOrderService.all.and.returnValue(deferredReleaseOrderPromise.promise);
            location = $location;
            scope = $rootScope.$new();
            sorter = $sorter;
            timeout = $timeout;

            spyOn(angular, 'element').and.callFake(function () {
                return {
                    modal : jasmine.createSpy('modal').and.callFake(function (status) {
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
                    PurchaseOrderService: mockPurchaseOrderService,
                    ReleaseOrderService: mockReleaseOrderService
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
        beforeEach(function () {
            deferredPurchaseOrderPromise.resolve(stubPurchaseOrders);
            deferredReleaseOrderPromise.resolve(stubReleaseOrders);
        });

        it('should set document on the scope', function () {
              scope.initialize();
              scope.$apply();
              expect(scope.documents).toEqual(stubPurchaseOrders);
        });

        it('should set document type on the scope', function () {
            var expectedDocumentType = 'PO';
            scope.initialize();
            scope.$apply();
            expect(scope.currentDocumentType).toEqual(expectedDocumentType);
        });

        it('should set the sorter', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sortBy).toBe(sorter);
        });

        it('should sort by document number', function () {
            scope.initialize();
            scope.$apply();
            expect(scope.sort.criteria).toBe('order_number');
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
            expect(scope.sortArrowClass('order_number')).toEqual('active glyphicon glyphicon-arrow-down');
        });

        it('should set the clicked column as active and have the up arrow when ascending', function () {
            scope.initialize();
            scope.sort.descending = true;
            scope.$apply();
            expect(scope.sortArrowClass('order_number')).toEqual('active glyphicon glyphicon-arrow-up');
        });
    });

    describe('when document type is toggled', function () {
        it('should know to use the purchase orders if the document type selected is purchase orders', function () {
            deferredPurchaseOrderPromise.resolve(stubPurchaseOrders);
            deferredReleaseOrderPromise.resolve(stubReleaseOrders);

            scope.initialize();
            scope.$apply();
            scope.toggleDocumentType('PO');
            expect(scope.documents).toEqual(stubPurchaseOrders);
        });

        it('should know to use the waybills if the document type selected is waybills', function () {
            deferredPurchaseOrderPromise.resolve(stubPurchaseOrders);
            deferredReleaseOrderPromise.resolve(stubReleaseOrders);

            scope.initialize();
            scope.$apply();
            scope.toggleDocumentType('WB');
            expect(scope.documents).toEqual(stubReleaseOrders);
        });
    });

    describe('when select document', function () {
        it('should change the location to for purchase order document', function () {
            var document = {id: 1, doc_number: 1234, date: '2014-10-09', programme: 'Safe Water'};
            scope.currentDocumentType = 'PO';
            scope.selectDocument(document);
            scope.$apply();
            expect(location.path()).toEqual('/field-verification-details/purchase-order/'+document.id);
        });

        it('should change the location to for waybill document', function () {
            var document = {id: 1, doc_number: 1234, date: '2014-10-09', programme: 'Safe Water'};
            scope.selectDocument(document);
            scope.$apply();
            expect(location.path()).toEqual('/field-verification-details/waybill/'+document.id);
        });
    });

    describe('when document type changes', function () {
        it('should change the placeholder to have purchase order text', function () {
            var expectedPlaceHolderMessage = 'Search by purchase order number, date or programme';
            scope.currentDocumentType = 'PO';
            scope.$apply();
            expect(scope.placeHolderText).toEqual(expectedPlaceHolderMessage);
        });

        it('should change the placeholder to have waybill text', function () {
            var expectedPlaceHolderMessage = 'Search by waybill number, date or programme';
            scope.currentDocumentType = 'WB';
            scope.$apply();
            expect(scope.placeHolderText).toEqual(expectedPlaceHolderMessage);
        });
    });
});