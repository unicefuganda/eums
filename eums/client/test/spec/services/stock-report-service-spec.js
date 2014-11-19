describe('Stock Report Service', function () {
    var mockBackend, endpointUrl, stubStockReport, stockReportService, consigneeId;

    consigneeId = 1;
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

    beforeEach(function () {
        module('StockReport');

        inject(function (StockReportService, EumsConfig, $httpBackend) {
            stockReportService = StockReportService;
            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.STOCK_REPORT;
        });
    });

    it('should get stock reports for a consignee', function (done) {
        mockBackend.whenGET(endpointUrl + consigneeId + '/').respond(stubStockReport);

        stockReportService.getStockReport(consigneeId).then(function (report) {
            expect(report).toEqual(stubStockReport);
        });
        done();
    });

    it('should compute totals for a given stock report', function () {
        var expectedTotals = {totalReceived: 50, totalDispensed: 25, totalBalance: 25};

        var totals = stockReportService.computeStockTotals(stubStockReport.data);

        expect(totals).toEqual(expectedTotals);
    });

    it('should compute totals for a given stock report with values passed as strings', function () {
        var stockReport = {
            data: [
                {
                    'document_number': '1',
                    'total_value_received': '20.0',
                    'total_value_dispensed': '10.0',
                    'balance': '10.0'
                },
                {
                    'document_number': '2',
                    'total_value_received': '30.0',
                    'total_value_dispensed': '15.0',
                    'balance': '15.0'
                }
            ]};
        var expectedTotals = {totalReceived: 50, totalDispensed: 25, totalBalance: 25};

        var totals = stockReportService.computeStockTotals(stockReport.data);

        expect(totals).toEqual(expectedTotals);
    });
});