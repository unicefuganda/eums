describe('Stock Report Service', function () {
    var mockBackend, endpointUrl, stubStockReport, stockReportService, consigneeId;

    consigneeId = 1;
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

    beforeEach(function () {
        module('StockReport');

        inject(function (StockReportService, EumsConfig, $httpBackend) {
            stockReportService = StockReportService;
            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.STOCK_REPORT;
        });
    });

    it('should get stock report for a consignee', function (done) {
        mockBackend.whenGET(endpointUrl + '?consignee=' + consigneeId).respond(stubStockReport);

        stockReportService.getStockReport({consignee: consigneeId}).then(function (response) {
            expect(response.data).toEqual(stubStockReport);
        });
        mockBackend.flush();
        done();
    });

    it('should get stock report for a location', function (done) {
        var location = 'Kampala';
        mockBackend.whenGET(endpointUrl + '?location=' + location).respond(stubStockReport);

        stockReportService.getStockReport({location: location}).then(function (response) {
            expect(response.data).toEqual(stubStockReport);
        });
        mockBackend.flush();
        done();
    });

    it('should get stock report for a location and a consignee', function (done) {
        var location = 'Kampala';
        var consigneeId = 2;
        mockBackend.whenGET(endpointUrl + '?location=' + location + '&consignee=' + consigneeId).respond(stubStockReport);

        stockReportService.getStockReport({location: location, consignee: consigneeId}).then(function (response) {
            expect(response.data).toEqual(stubStockReport);
        });
        mockBackend.flush();
        done();
    });

    it('should get all stock reports', function (done) {
        mockBackend.whenGET(endpointUrl).respond(stubStockReport);

        stockReportService.getStockReport().then(function (response) {
            expect(response.data).toEqual(stubStockReport);
        });
        mockBackend.flush();
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
            ]
        };
        var expectedTotals = {totalReceived: 50, totalDispensed: 25, totalBalance: 25};

        var totals = stockReportService.computeStockTotals(stockReport.data);

        expect(totals).toEqual(expectedTotals);
    });
});