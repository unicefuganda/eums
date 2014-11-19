describe('StockReportController', function () {
    var scope, mockStockReportService, mockConsigneeService, stubStockReport, deferredStubReport,
        stubStockTotals, deferredStubIPs;

    stubStockReport = {
        data: [
            {
                'document_number': '1',
                'total_value_received': 20.0,
                'total_value_dispensed': 10.0,
                'balance': 10.0
            },
            {
                'document_number': '2',
                'total_value_received': 30.0,
                'total_value_dispensed': 15.0,
                'balance': 15.0
            }
        ]};

    stubStockTotals = {totalReceived: 40, totalDispensed: 30, totalBalance: 10};

    beforeEach(function () {
        module('StockReport');
        mockStockReportService = jasmine.createSpyObj('mockStockReportService', ['getStockReport', 'computeStockTotals']);

        inject(function ($controller, $rootScope, $q) {
            deferredStubIPs = $q.defer();
            deferredStubReport = $q.defer();
            mockStockReportService.getStockReport.and.returnValue(deferredStubReport.promise);
            mockStockReportService.computeStockTotals.and.returnValue(stubStockTotals);

            scope = $rootScope.$new();
            scope.selectedIpId = undefined;

            $controller('StockReportController',
                {
                    $scope: scope,
                    StockReportService: mockStockReportService,
                    ConsigneeService: mockConsigneeService
                });
        });
    });

    it('should not try to load stock report when ip is not selected', function () {
        scope.selectedIPId = null;
        scope.$apply();

        expect(mockStockReportService.getStockReport).not.toHaveBeenCalled();
    });

    it('should load stock report when ip is selected', function () {
        deferredStubReport.resolve(stubStockReport);
        scope.selectedIPId = 1;
        scope.$apply();

        expect(mockStockReportService.getStockReport).toHaveBeenCalledWith(1);
        expect(mockStockReportService.computeStockTotals).toHaveBeenCalledWith(stubStockReport.data);
    });
});