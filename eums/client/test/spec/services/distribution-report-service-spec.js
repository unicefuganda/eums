describe('Distribution report Service', function() {
    var mockBackend, reportService, config;

    beforeEach(function() {
        module('GlobalStats');

        inject(function(DistributionReportService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            reportService = DistributionReportService;
            config = EumsConfig;
        });
    });

    it('should get report from backend', function(done) {
        var expectedReports = [{consignee: 1, programme: 1, otherDetails: {}}];

        mockBackend.whenGET(config.DISTRIBUTION_REPORT + '/').respond(expectedReports);
        reportService.getReports().then(function(reports) {
            expect(reports).toEqual(expectedReports);
            done();
        });
        mockBackend.flush();
    });

    it('should get total stats from report', function() {
        var reports = [
            {
                total_received_with_quality_issues: 1,
                total_received_with_quantity_issues: 1,
                total_received_without_issues: 1,
                total_not_received: 1,
                total_distributed_with_quality_issues: 1,
                total_distributed_with_quantity_issues: 1,
                total_distributed_without_issues: 1,
                total_not_distributed: 1
            },
            {
                total_received_with_quality_issues: 2,
                total_received_with_quantity_issues: 2,
                total_received_without_issues: 2,
                total_not_received: 2,
                total_distributed_with_quality_issues: 2,
                total_distributed_with_quantity_issues: 2,
                total_distributed_without_issues: 2,
                total_not_distributed: 2
            }
        ];
        var totals = reportService.getTotals(reports);
        expect(totals).toEqual({received: 9, notReceived: 3, distributed: 9, notDistributed: 3});
    });
});
