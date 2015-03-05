describe('NewDistributionPlanController', function () {
    var location, scope, sorter, timeout, q;
    var mockDistributionReportingParametersService, mockIPService, mockPurchaseOrderService, mockReleaseOrderService;
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

        mockDistributionReportingParametersService = jasmine.createSpyObj('mockDistributionReportingParametersService', ['saveVariable', 'retrieveVariable']);
        mockIPService = jasmine.createSpyObj('mockIPService', ['loadAllDistricts']);
        mockPurchaseOrderService = jasmine.createSpyObj('mockPurchaseOrderService', ['getPurchaseOrders']);
        mockReleaseOrderService = jasmine.createSpyObj('mockReleaseOrderService', ['getReleaseOrders']);

        inject(function ($controller, $rootScope, $location, $sorter, $timeout, $q) {
            q = $q;
            deferred = $q.defer();
            deferredPurchaseOrderPromise = $q.defer();
            deferredReleaseOrderPromise = $q.defer();
            mockIPService.loadAllDistricts.and.returnValue(deferred.promise);
            mockPurchaseOrderService.getPurchaseOrders.and.returnValue(deferredPurchaseOrderPromise.promise);
            mockReleaseOrderService.getReleaseOrders.and.returnValue(deferredReleaseOrderPromise.promise);
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
                    DistributionReportingParameters: mockDistributionReportingParametersService,
                    IPService: mockIPService,
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
            mockDistributionReportingParametersService.retrieveVariable.and.returnValue(expectedDocumentType);
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
        it('should know to call the save variable with PO if type is purchase orders', function () {
            scope.toggleDocumentType('PO');
            scope.$apply();
            expect(mockDistributionReportingParametersService.saveVariable).toHaveBeenCalledWith('currentDocumentType', 'PO');

        });

        it('should know to call the save variable with WB if type is waybills', function () {
            scope.toggleDocumentType('WB');
            scope.$apply();
            expect(mockDistributionReportingParametersService.saveVariable).toHaveBeenCalledWith('currentDocumentType', 'WB');

        });

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
        it('should change the location to details', function () {
            var document = {id: 1, doc_number: 1234, date: '2014-10-09', programme: 'Safe Water'};
            scope.selectDocument(document);
            scope.$apply();
            expect(location.path()).toEqual('/field-verification-report/details/');
        });

        it('should save the order details', function () {
            var document = {id: 1, doc_number: 1234, date: '2014-10-09', programme: 'Safe Water'};

            var expectedOrderDetails = {
                id: document.id, order_number: document.doc_number, date: document.date, programme: document.programme,
                items: [
                    {id: 1, description: 'Printer cartridges HP 21', materialCode: '213442', quantity: 20, unit: 'each',
                        responses: [
                            {
                                received: 'YES',
                                quantity: 30,
                                consignee: 'Jinja Hospital',
                                dateReceived: '01/10/2014',
                                quality: 'Damaged',
                                location: 'Jinja',
                                remark: ''
                            }
                        ]},
                    {id: 2, description: 'School Books', materialCode: '2123342', quantity: 100, unit: 'cartons', responses: [
                        {
                            received: 'NO',
                            quantity: '',
                            consignee: 'Director Shimoni',
                            dateReceived: '',
                            quality: '',
                            location: 'Wakiso',
                            remark: '2 weeks delay'
                        }
                    ]},
                    {id: 1, description: 'Dell Computers', materialCode: '21346256', quantity: 500, unit: 'each', responses: [
                        {
                            received: 'YES',
                            quantity: 23,
                            consignee: 'Head Teacher Nyakasura',
                            dateReceived: '01/10/2014',
                            quality: 'Substandard',
                            location: 'Buvuma',
                            remark: ''
                        }
                    ]},
                    {id: 1, description: 'School text books', materialCode: '56787562', quantity: 600, unit: 'each', responses: [
                        {
                            received: 'NO',
                            quantity: '',
                            consignee: 'Director KPS',
                            dateReceived: '',
                            quality: '',
                            location: 'Kampala',
                            remark: 'No response from IP'
                        }
                    ]}
                ]};
            scope.selectDocument(document);
            scope.$apply();
            expect(mockDistributionReportingParametersService.saveVariable).toHaveBeenCalledWith('selectedPurchaseOrder', expectedOrderDetails);
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

    describe('when save responses', function () {
        it('should set the scope variable to true', function () {
            scope.saveResponses();
            scope.$apply();
            expect(scope.reportSaved).toBeTruthy();
        });

        it('should set the scope variable to false when time out happens', function(){
            scope.saveResponses();
            timeout.flush();
            scope.$apply();

            expect(scope.reportSaved).toBeFalsy();
        });
    });

    describe('when add responses', function () {
        it('should have document selected with default values', function () {
            var expectedResponse = {responses: [
                {
                    received: '',
                    quantity: '',
                    consignee: '',
                    dateReceived: '',
                    quality: '',
                    location: ''
                }
            ]};
            scope.documentItemSelected = {responses: []};
            scope.addResponse();
            scope.$apply();
            expect(scope.documentItemSelected).toEqual(expectedResponse);
        });

        it('should set the date picker', function () {
            scope.documentItemSelected = {responses: []};
            scope.addResponse();
            scope.$apply();
            expect(scope.datepicker).toEqual({0: false});
        });
    });
});

describe('DistributionReportingParameters', function(){
    beforeEach(module('ManualReporting'));


    it('should know how to save and retrieve variables', inject(function(DistributionReportingParameters){
        var expectedValue = 'Test Variable';
        var expectedKey = 'test_variable';
        DistributionReportingParameters.saveVariable(expectedKey, expectedValue);
        expect(DistributionReportingParameters.retrieveVariable(expectedKey)).toEqual(expectedValue);
    }));
});