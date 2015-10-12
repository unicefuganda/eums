describe('StockReportController', function () {
    var scope, mockStockReportService, mockConsigneeService, mockIpService, stubStockReport, deferredStubReport,
        stubDistricts, toastPromise, mockToastProvider, stubStockTotals, deferredStubIPs, deferredDistricts;

    stubStockReport = {
        data: [
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
    };

    stubStockTotals = {totalReceived: 40, totalDispensed: 30, totalBalance: 10};
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
            mockStockReportService.getStockReportForLocationAndConsignee.and.returnValue(deferredStubReport.promise);
            mockStockReportService.getStockReportForConsignee.and.returnValue(deferredStubReport.promise);
            mockStockReportService.getStockReportForLocation.and.returnValue(deferredStubReport.promise);
            mockStockReportService.computeStockTotals.and.returnValue(stubStockTotals);
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

        expect(mockStockReportService.getStockReportForConsignee).toHaveBeenCalledWith(1);
        expect(mockStockReportService.computeStockTotals).toHaveBeenCalledWith(stubStockReport.data);
    });

    it('should show an error toast if there is no data for that IP', function () {
        deferredStubReport.resolve({data: []});
        scope.reportParams.selectedIPId = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReportForConsignee).toHaveBeenCalledWith(1);
        expect(mockStockReportService.computeStockTotals).not.toHaveBeenCalled();
        expect(mockToastProvider.create).toHaveBeenCalledWith({
            content: 'There is no data for this IP!',
            class: 'danger',
            maxNumber: 1,
            dismissOnTimeout: true
        });

    });

    it('should load stock report for selected location', function () {
        deferredStubReport.resolve(stubStockReport);
        scope.reportParams.selectedLocation = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReportForLocation).toHaveBeenCalledWith(1);
        expect(mockStockReportService.computeStockTotals).toHaveBeenCalledWith(stubStockReport.data);
    });

    it('should show an error toast if there is no data for that location', function () {
        deferredStubReport.resolve({data: []});
        scope.reportParams.selectedLocation = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReportForLocation).toHaveBeenCalledWith(1);
        expect(mockStockReportService.computeStockTotals).not.toHaveBeenCalled();
        expect(mockToastProvider.create).toHaveBeenCalledWith({
            content: 'There is no data for this Location!',
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

        expect(mockStockReportService.getStockReportForLocationAndConsignee).toHaveBeenCalledWith(2, 1);
        expect(mockStockReportService.computeStockTotals).toHaveBeenCalledWith(stubStockReport.data);
    });

    it('should show an error toast if there is no data for that location and ip', function () {
        deferredStubReport.resolve({data: []});
        scope.reportParams.selectedLocation = 1;
        scope.$apply();
        scope.reportParams.selectedIPId=4;
        scope.$apply();

        expect(mockStockReportService.getStockReportForLocation).toHaveBeenCalledWith(1);
        expect(mockStockReportService.computeStockTotals).not.toHaveBeenCalled();
        expect(mockToastProvider.create).toHaveBeenCalledWith({
            content: 'There is no data for the selected!',
            class: 'danger',
            maxNumber: 1,
            dismissOnTimeout: true
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