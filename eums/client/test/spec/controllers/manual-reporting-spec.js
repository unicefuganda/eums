describe('NewDistributionPlanController', function () {
    var location, scope, sorter, timeout, mockDistributionReportingParametersService, mockIPService, deferred;

    beforeEach(module('ManualReporting'));

    beforeEach(function () {

        mockDistributionReportingParametersService = jasmine.createSpyObj('mockDistributionReportingParametersService', ['saveVariable', 'retrieveVariable']);
        mockIPService = jasmine.createSpyObj('mockIPService', ['loadAllDistricts']);

        inject(function ($controller, $rootScope, $location, $sorter, $timeout, $q) {
            deferred = $q.defer();
            mockIPService.loadAllDistricts.and.returnValue(deferred.promise);
            location = $location;
            scope = $rootScope.$new();
            sorter = $sorter;
            timeout = $timeout;

            $controller('ManualReportingController',
                {
                    $scope: scope,
                    $location: location,
                    DistributionReportingParameters: mockDistributionReportingParametersService,
                    IPService: mockIPService,
                    $timeout: timeout,
                    $sorter: sorter
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
        it('should set document on the scope', function () {
            var purchaseOrders = [
                {id: 1, doc_number: 65025072, date: '11/11/2014', programme: 'YI107 - PCR 3 KEEP CHILDREN SAFE'},
                {id: 2, doc_number: 65025073, date: '2/10/2013', programme: 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'},
                {id: 3, doc_number: 65025496, date: '12/03/2013', programme: 'Y108 - PCR 4 CROSS SECTORAL'},
                {id: 4, doc_number: 65025623, date: '3/3/2013', programme: 'YP109 - PCR 5 SUPPORT'},
                {id: 5, doc_number: 65026064, date: '2/3/2014', programme: 'YI106 - PCR 2 KEEP CHILDREN LEARNING'},
                {id: 6, doc_number: 65026445, date: '4/21/2014', programme: 'YI101 KEEP CHILDREN AND MOTHERS ALIVE'}
            ];
            scope.initialize();
            scope.$apply();
            expect(scope.documents).toEqual(purchaseOrders);
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
            expect(scope.sort.criteria).toBe('doc_number');
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
            expect(scope.sortArrowClass('doc_number')).toEqual('active glyphicon glyphicon-arrow-down');
        });

        it('should set the clicked column as active and have the up arrow when ascending', function () {
            scope.initialize();
            scope.sort.descending = true;
            scope.$apply();
            expect(scope.sortArrowClass('doc_number')).toEqual('active glyphicon glyphicon-arrow-up');
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
            var purchaseOrders = [
                {id: 1, doc_number: 65025072, date: '11/11/2014', programme: 'YI107 - PCR 3 KEEP CHILDREN SAFE'},
                {id: 2, doc_number: 65025073, date: '2/10/2013', programme: 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'},
                {id: 3, doc_number: 65025496, date: '12/03/2013', programme: 'Y108 - PCR 4 CROSS SECTORAL'},
                {id: 4, doc_number: 65025623, date: '3/3/2013', programme: 'YP109 - PCR 5 SUPPORT'},
                {id: 5, doc_number: 65026064, date: '2/3/2014', programme: 'YI106 - PCR 2 KEEP CHILDREN LEARNING'},
                {id: 6, doc_number: 65026445, date: '4/21/2014', programme: 'YI101 KEEP CHILDREN AND MOTHERS ALIVE'}
            ];

            scope.initialize();
            scope.$apply();
            scope.toggleDocumentType('PO');
            expect(scope.documents).toEqual(purchaseOrders);
        });

        it('should know to use the waybills if the document type selected is waybills', function () {
            var waybills = [
                {id: 1, doc_number: 72081598, date: '12/13/2012', programme: 'YI101 KEEP CHILDREN AND MOTHERS ALIVE'},
                {id: 2, doc_number: 72994735, date: '2/14/2013', programme: 'YI106 - PCR 2 KEEP CHILDREN LEARNING'},
                {id: 3, doc_number: 34839344, date: '2/14/2013', programme: 'YP109 - PCR 5 SUPPORT'},
                {id: 4, doc_number: 20038445, date: '3/3/2013', programme: 'YI107 - PCR 3 KEEP CHILDREN SAFE'},
                {id: 5, doc_number: 90384434, date: '3/3/2013', programme: 'Y108 - PCR 4 CROSS SECTORAL'},
                {id: 6, doc_number: 10293800, date: '3/25/2013', programme: 'YI106 - PCR 2 KEEP CHILDREN LEARNING'}
            ];

            scope.initialize();
            scope.$apply();
            scope.toggleDocumentType('WB');
            expect(scope.documents).toEqual(waybills);
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