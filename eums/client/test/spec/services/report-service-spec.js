describe('Report Service', function () {

    var config, mockBackend, reportService;

    beforeEach(function () {
        module('ReportService');

        inject(function (ReportService, $httpBackend, $q, EumsConfig, $http) {
            q = $q;
            http = $http;
            config = EumsConfig;

            mockBackend = $httpBackend;
            reportService = ReportService;
        });
    });

    it('should get all ip responses', function () {
        var fakeResponses = {data: 'some responses'};
        mockBackend.whenGET('/api/ip-responses/').respond(200, fakeResponses);
        reportService.allIpResponses().then(function (result) {
            expect(result.data).toEqual('some responses');
        });
        mockBackend.flush();
    });

    it('should get ip feedback', function(){
        var fakeReport = {results:[{id:34}]};
        mockBackend.whenGET('/api/api-feedback-report').respond(200, fakeReport);
        reportService.ipFeedbackReport().then(function(response){
            expect(response.data).toEqual(fakeReport);
        })
    })

});