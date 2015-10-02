describe('StockReportController', function() {
    var scope, mockStockReportService, mockConsigneeService, stubStockReport, deferredStubReport,
        toastPromise, mockToastProvider, stubStockTotals, deferredStubIPs;

    stubStockReport = {
        data: [
            {
                document_number: '1',
                total_value_received: 20.0,
                total_value_dispensed: 10.0,
                balance: 10.0,
                items: [
                    {code: 'Code 1',
                        description: 'description',
                        quantity_delivered: 3,
                        date_delivered: '2014-01-01',
                        quantity_confirmed: 2,
                        date_confirmed: '2014-01-02',
                        quantity_dispatched: 1,
                        balance: 1
                    },
                    {code: 'Code 2',
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
                    {code: 'Code 3',
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
        ]};

    stubStockTotals = {totalReceived: 40, totalDispensed: 30, totalBalance: 10};

    beforeEach(function() {
        module('StockReport');

        mockStockReportService = jasmine.createSpyObj('mockStockReportService', ['getStockReport', 'computeStockTotals']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);

        inject(function($controller, $rootScope, $q) {
            deferredStubIPs = $q.defer();
            deferredStubReport = $q.defer();
            toastPromise = $q.defer();
            mockStockReportService.getStockReport.and.returnValue(deferredStubReport.promise);
            mockStockReportService.computeStockTotals.and.returnValue(stubStockTotals);
            mockToastProvider.create.and.returnValue(toastPromise.promise);

            scope = $rootScope.$new();
            scope.selectedIpId = undefined;

            $controller('StockReportController',
                {
                    $scope: scope,
                    StockReportService: mockStockReportService,
                    ConsigneeService: mockConsigneeService,
                    ngToast: mockToastProvider
                });
        });
    });

    it('should load stock report at initial load', function() {
        scope.selectedIPId = null;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalled();
    });

    it('should load stock report when ip is selected', function() {
        deferredStubReport.resolve(stubStockReport);
        scope.selectedIPId = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith(1);
        expect(mockStockReportService.computeStockTotals).toHaveBeenCalledWith(stubStockReport.data);
    });

    it('should show an error toast if there is no data for that IP', function() {
        deferredStubReport.resolve({data: []});
        scope.selectedIPId = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith(1);
        expect(mockStockReportService.computeStockTotals).not.toHaveBeenCalled();
        expect(mockToastProvider.create).toHaveBeenCalledWith({
            content: 'There is no data for this IP',
            class: 'danger',
            maxNumber: 1,
            dismissOnTimeout: true
        });

    });
});