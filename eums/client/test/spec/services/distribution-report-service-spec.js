describe('Distribution report Service', function() {
    var mockBackend, reportService, config;
    var consigneeOneId = 1;
    var consigneeTwoId = 2;
    var programmeOneId = 1;
    var programmeTwoId = 2;

    var reports = [
        {
            consignee: consigneeOneId,
            programme: programmeOneId,
            total_received: 2,
            total_not_received: 1,
            total_distributed: 1
        },
        {
            consignee: consigneeTwoId,
            programme: programmeOneId,
            total_received: 2,
            total_not_received: 1,
            total_distributed: 2
        },
        {
            consignee: consigneeTwoId,
            programme: programmeTwoId,
            total_received: 2,
            total_not_received: 3,
            total_distributed: 1
        }
    ];

    beforeEach(function() {
        module('GlobalStats');

        inject(function(DistributionReportService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            reportService = DistributionReportService;
            config = EumsConfig;
        });
    });

    it('should get report from backend', function(done) {
        var expectedReports = [
            {consignee: 1, programme: 1, otherDetails: {}}
        ];

        mockBackend.whenGET(config.BACKEND_URLS.DISTRIBUTION_REPORT).respond(expectedReports);
        reportService.getReports().then(function(reports) {
            expect(reports).toEqual(expectedReports);
            done();
        });
        mockBackend.flush();
    });

    it('should get total stats from report', function() {
        var totals = reportService.getTotals(reports);
        expect(totals).toEqual({ received : 6, notReceived : 5, distributed : 4, notDistributed : 2});
    });

    it('should get total stats by consignee', function() {
        var totals = reportService.getTotals(reports, {consignee: consigneeOneId});
        expect(totals).toEqual({ received : 2, notReceived : 1, distributed : 1, notDistributed : 1});
    });

    it('should get total stats by programme', function() {
        var totals = reportService.getTotals(reports, {programme: programmeOneId});
        expect(totals).toEqual({ received : 4, notReceived : 2, distributed : 3, notDistributed : 1});
    });

    it('should get total stats by programme and consignee', function() {
        var totals = reportService.getTotals(reports, {programme: programmeOneId, consignee: consigneeOneId});
        expect(totals).toEqual({ received : 2, notReceived : 1, distributed : 1, notDistributed : 1});
    });

    it('should parse consignee and programme option params to int before getting totals', function() {
        var totals = reportService.getTotals(reports, {programme: String(programmeOneId), consignee: String(consigneeOneId)});
        expect(totals).toEqual({ received : 2, notReceived : 1, distributed : 1, notDistributed : 1});
    });
});
