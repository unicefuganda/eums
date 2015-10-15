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

        inject(function ($controller, $rootScope, $q) {
            deferredStubIPs = $q.defer();
            deferredStubReport = $q.defer();
            toastPromise = $q.defer();
            deferredDistricts = $q.defer();

            mockStockReportService.getStockReport.and.returnValue(deferredStubReport.promise);
            mockToastProvider.create.and.returnValue(toastPromise.promise);
            mockIpService.loadAllDistricts.and.returnValue(deferredDistricts.promise);

            scope = $rootScope.$new();
            scope.selectedIpId = undefined;

            $controller('StockReportController',
                {
                    $scope: scope,
                    StockReportService: mockStockReportService,
                    ConsigneeService: mockConsigneeService,
                    ngToast: mockToastProvider,
                    IPService: mockIpService
                });
        });
    });

    it('should load stock report at initial load', function () {
        scope.reportParams.selectedIPId = null;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalled();
    });

    it('should load districts at initial load', function () {
        deferredDistricts.resolve(stubDistricts);
        scope.$apply();

        expect(mockIpService.loadAllDistricts).toHaveBeenCalled();
        expect(scope.districts).toEqual([{id: 'Adjumani', name: 'Adjumani'}, {id: 'Luweero', name: 'Luweero'}])
    });

    it('should load stock report for selected IP', function () {
        deferredStubReport.resolve(stubStockReport);
        scope.reportParams.selectedIPId = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({consignee: 1});
    });

    it('should show an error toast if there is no data for that IP', function () {
        deferredStubReport.resolve({data: {results: []}});
        scope.reportParams.selectedIPId = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({consignee: 1});
        expect(mockToastProvider.create).toHaveBeenCalledWith({
            content: 'There is no data for the specified filters!',
            class: 'danger',
            maxNumber: 1,
            dismissOnTimeout: true
        });

    });

    it('should load stock report for selected location', function () {
        deferredStubReport.resolve(stubStockReport);
        scope.reportParams.selectedLocation = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({location: 1});
    });

    it('should show an error toast if there is no data for that location', function () {
        deferredStubReport.resolve({data: {results: []}});
        scope.reportParams.selectedLocation = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({location: 1});
        expect(mockToastProvider.create).toHaveBeenCalledWith({
            content: 'There is no data for the specified filters!',
            class: 'danger',
            maxNumber: 1,
            dismissOnTimeout: true
        });

    });

    it('should load stock report for selected location and IP', function () {
        deferredStubReport.resolve(stubStockReport);
        scope.reportParams.selectedLocation = 2;
        scope.$apply();
        scope.reportParams.selectedIPId = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({location: 2, consignee: 1});
    });

    it('should show an error toast if there is no data for that location and ip', function () {
        deferredStubReport.resolve({data: {results: []}});
        scope.reportParams.selectedLocation = 1;
        scope.$apply();
        scope.reportParams.selectedIPId = 4;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({location: 1});
        expect(mockToastProvider.create).toHaveBeenCalledWith({
            content: 'There is no data for the specified filters!',
            class: 'danger',
            maxNumber: 1,
            dismissOnTimeout: true
        });

    });

    it('should load stock report for selected IP and location', function () {
        deferredStubReport.resolve(stubStockReport);
        scope.reportParams.selectedIPId = 3;
        scope.$apply();
        scope.reportParams.selectedLocation = 4;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith({location: 4, consignee: 3});
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