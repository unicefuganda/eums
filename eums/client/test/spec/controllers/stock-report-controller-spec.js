describe('StockReportController', function () {
    var scope, mockStockReportService, mockConsigneeService, mockIpService, stubStockReport, deferredStubReport,
        stubDistricts, toastPromise, mockToastProvider, deferredStubIPs, deferredDistricts;

    stubStockReport = {
        data: {
            count: 2,
            pageSize: 10,
            results: [
                {
                    document_number: '1',
                    total_value_received: 20.0,
                    total_value_dispensed: 10.0,
                    balance: 10.0,
                    items: [
                        {
                            code: 'Code 1',
                            description: 'description',
                            quantity_delivered: 3,
                            date_delivered: '2014-01-01',
                            quantity_confirmed: 2,
                            date_confirmed: '2014-01-02',
                            quantity_dispatched: 1,
                            balance: 1
                        },
                        {
                            code: 'Code 2',
                            description: 'description',
                            quantity_delivered: 4,
                            date_delivered: '2014-01-01',
                            quantity_confirmed: 2,
                            date_confirmed: '2014-01-02',
                            quantity_dispatched: 2,
                            balance: 1
                        }
                    ]
                },
                {
                    'document_number': '2',
                    'total_value_received': 30.0,
                    'total_value_dispensed': 15.0,
                    'balance': 15.0,
                    items: [
                        {
                            code: 'Code 3',
                            description: 'description',
                            quantity_delivered: 4,
                            date_delivered: '2014-01-01',
                            quantity_confirmed: 2,
                            date_confirmed: '2014-01-02',
                            quantity_dispatched: 2,
                            balance: 1
                        }
                    ]
                }
            ]
        }
    };

    stubDistricts = {data: ['Adjumani', 'Luweero']};

    beforeEach(function () {
        module('StockReport');

        mockStockReportService = jasmine.createSpyObj('mockStockReportService', ['getStockReportForLocationAndConsignee',
            'getStockReportForLocation', 'getStockReportForConsignee', 'getStockReport', 'computeStockTotals']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);
        mockIpService = jasmine.createSpyObj('mockIpService', ['loadAllDistricts']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader']);

        inject(function ($controller, $rootScope, $q) {
            deferredStubIPs = $q.defer();
            deferredStubReport = $q.defer();
            toastPromise = $q.defer();
            deferredDistricts = $q.defer();

            mockStockReportService.getStockReport.and.returnValue(deferredStubReport.promise);
            mockToastProvider.create.and.returnValue(toastPromise.promise);
            mockIpService.loadAllDistricts.and.returnValue(deferredDistricts.promise);

            scope = $rootScope.$new();

            $controller('StockReportController', {
                $scope: scope,
                StockReportService: mockStockReportService,
                ConsigneeService: mockConsigneeService,
                ngToast: mockToastProvider,
                IPService: mockIpService,
                LoaderService: mockLoaderService
            });
        });
    });

    describe('on initial load', function () {

        it('should load stock report', function () {
            scope.reportParams = {};
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(1);
            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({});
        });

        it('should load districts', function () {
            deferredDistricts.resolve(stubDistricts);
            scope.$apply();
            expect(mockIpService.loadAllDistricts).toHaveBeenCalled();
            expect(scope.districts).toEqual([{id: 'Adjumani', name: 'Adjumani'}, {id: 'Luweero', name: 'Luweero'}])
        });
    });

    describe('after initial load', function () {

        beforeEach(function () {
            // Initial Load
            scope.reportParams = {}
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(1);
        });

        it('should load stock report for selected IP', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.reportParams.selectedIPId = 1;
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({consignee: 1});
        });

        it('should load stock report for selected location', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.reportParams.selectedLocation = 1;
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({location: 1});
        });

        it('should load stock report for selected location and IP', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.reportParams.selectedLocation = 2;
            scope.$apply();
            scope.reportParams.selectedIPId = 1;
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({location: 2, consignee: 1});
        });

        it('should load stock report for selected from date', function () {
            scope.reportParams.selectedFromDate = '01-Nov-2015';
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({fromDate: '2015-11-01'});
        });

        it('should load stock report for selected to date', function () {
            scope.reportParams.selectedToDate = '01-Nov-2015';
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({toDate: '2015-11-01'});
        });

        it('should load stock report for selected outcome', function () {
            scope.reportParams.selectedOutcomeId = 7;
            scope.$apply();
            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({outcome: 7});
        });

        it('should load stock report when clearing outcome filter', function () {
            scope.reportParams.selectedOutcomeId = 7;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.reportParams.selectedOutcomeId = undefined;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(3);
        });

        it('should load stock report when clearing location filter', function () {
            scope.reportParams.selectedLocation = 'Adjumani';
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.reportParams.selectedLocation = undefined;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(3);
        });

        it('should load stock report when clearing IP filter', function () {
            scope.reportParams.selectedIPId = 5;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.reportParams.selectedIPId = undefined;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(3);
        });

        it('should not load stock report when selecting same location', function () {
            scope.reportParams.selectedLocation = 'Adjumani';
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);
        });

        it('should not load stock report when selecting same IP', function () {
            scope.reportParams.selectedIPId = 5;
            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);

            scope.$apply();
            expect(mockStockReportService.getStockReport.calls.count()).toEqual(2);
        });

        it('should set scope results to empty when no results', function () {
            deferredStubReport.resolve({data: {results: []}});
            scope.$apply();
            expect(scope.reportData).toEqual([]);
        });

        it('should load stock report for page', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.goToPage(2);
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({page: 2});
            expect(scope.count).toBe(2);
            expect(scope.pageSize).toBe(10);
        });

        it('should load stock report for page with selected ip and location', function () {
            deferredStubReport.resolve(stubStockReport);
            scope.reportParams.selectedIPId = 5;
            scope.$apply();
            scope.reportParams.selectedLocation = 4;
            scope.$apply();
            scope.goToPage(3);
            scope.$apply();

            expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({location: 4, consignee: 5, page: 3});
        });

        it('should not have empty data response when data is undefined', function () {
            scope.reportData = undefined;
            expect(scope.hasEmptyDataResponse()).toBeFalsy();
        });

        it('should have empty data response when actual response is empty', function () {
            scope.reportData = [];
            expect(scope.hasEmptyDataResponse()).toBeTruthy();
        });

        it('should not have empty data response when actual response has data', function () {
            scope.reportData = ['some data'];
            expect(scope.hasEmptyDataResponse()).toBeFalsy();
        });
    });

    describe('Toggle document', function () {
        it('should set the open document identifier', function () {
            scope.toggleOpenDocument(473732);
            scope.$apply();

            expect(scope.openDocument).toBe(473732);
        });

        it('should unset the open document identifier', function () {
            scope.openDocument = 473732;
            scope.$apply();

            scope.toggleOpenDocument(473732);
            scope.$apply();

            expect(scope.openDocument).toBe(undefined);
        });
    })
});