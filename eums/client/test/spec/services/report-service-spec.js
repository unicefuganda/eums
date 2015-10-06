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

    it('should get ip feedback with no filters', function(){
        var fakeReport = {results:[{id:34}]};
        var url = '/api/ip-feedback-report-by-item';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport().then(function(response){
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback with filters', function(){
        var fakeReport = {results:[{id:34}]};
        var url = '/api/ip-feedback-report-by-item?programme_id=2';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport({programmeId: 2}).then(function(response){
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback with multiple filters', function(){
        var fakeReport = {results:[{id:34}]};
        var url = '/api/ip-feedback-report-by-item?programme_id=2&consignee_id=1&item_description=something+interesting&po_waybill=309';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport({programmeId: 2, consigneeId: 1, itemDescription: 'something interesting', poWaybill: 309}).then(function(response){
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback with filters of multiple words', function(){
        var fakeReport = {results:[{id:34}]};
        var url = '/api/ip-feedback-report-by-item?item_description=something+interesting';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport({itemDescription: 'something interesting'}).then(function(response){
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback report paginated', function(){
        var fakeReport = {results:[{id:34}]};
        var url = '/api/ip-feedback-report-by-item?page=2';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport({page: '2'}).then(function(response){
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback by delivery with no filters', function(){
        var fakeReport = {results:[{id:2}]};
        var url = '/api/ip-feedback-report-by-delivery';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReportByDelivery().then(function(response){
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

});