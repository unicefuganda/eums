describe('Supply Efficiency Service', function () {
    var mockBackend, service, config, queries;

    beforeEach(function () {
        module('SupplyEfficiencyReport');
        inject(function (SupplyEfficiencyReportService, $httpBackend, EumsConfig, Queries) {
            service = SupplyEfficiencyReportService;
            mockBackend = $httpBackend;
            config = EumsConfig;
            queries = Queries;
        });
    });

    it('should fetch unfiltered report by delivery when view is delivery', function (done) {
        var fakeReport = {'buckets': []};
        var fakeEsResponse = {aggregations: {deliveries: fakeReport}};
        var url = config.ELASTIC_SEARCH_URL + '_search?search_type=count';
        mockBackend.whenPOST(url, queries.baseQuery).respond(fakeEsResponse);

        service.generate(service.VIEWS.DELIVERY, {}).then(function (report) {
            expect(report).toEqual(fakeReport);
            done();
        });
        mockBackend.flush();
    });
});
