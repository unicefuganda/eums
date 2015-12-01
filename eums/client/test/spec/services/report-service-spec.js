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

    it('should get ip feedback with no filters', function () {
        var fakeReport = {results: [{id: 34}]};
        var url = '/api/item-feedback-report';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport().then(function (response) {
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback with filters', function () {
        var fakeReport = {results: [{id: 34}]};
        var url = '/api/item-feedback-report?programme_id=2';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport({programmeId: 2}).then(function (response) {
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback with multiple filters', function () {
        var fakeReport = {results: [{id: 34}]};
        var url = '/api/item-feedback-report?programme_id=2&consignee_id=1&item_description=something+interesting&po_waybill=309';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport({
            programmeId: 2,
            consigneeId: 1,
            itemDescription: 'something interesting',
            poWaybill: 309
        }).then(function (response) {
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback with filters of multiple words', function () {
        var fakeReport = {results: [{id: 34}]};
        var url = '/api/item-feedback-report?item_description=something+interesting';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport({itemDescription: 'something interesting'}).then(function (response) {
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback report paginated', function () {
        var fakeReport = {results: [{id: 34}]};
        var url = '/api/item-feedback-report?page=2';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReport({}, 2).then(function (response) {
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get ip feedback by delivery with no filters', function () {
        var fakeReport = {results: [{id: 2}]};
        var url = '/api/ip-feedback-report-by-delivery';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        reportService.ipFeedbackReportByDelivery().then(function (response) {
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get item feedback with filters', function () {
        var fakeReport = {results: [{id: 2}]};
        var url = '/api/item-feedback-report?programme_id=6&page=2&ip_id=2&tree_position=END_USER';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        var params = {
            ipId: 2,
            programmeId: 6,
            treePosition: 'END_USER'
        };
        reportService.itemFeedbackReport(params, 2).then(function (response) {
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get item feedback with filters received, quality and satisfied', function () {
        var fakeReport = {results: [{id: 2}]};
        var url = '/api/item-feedback-report?page=2&received=Yes&quality=damaged&satisfied=No';

        mockBackend.whenGET(url).respond(200, fakeReport);
        mockBackend.expectGET(url);

        var params = {
            received: 'Yes',
            quality: 'damaged',
            satisfied: 'No'
        };
        reportService.itemFeedbackReport(params, 2).then(function (response) {
            expect(response).toEqual(fakeReport);
        });
        mockBackend.flush();
    });

    it('should get export successfully message when export delivery feedback report', function () {
        var message = {'message': 'Generating CSV, you will be notified via email once it is done.'};
        var url = config.BACKEND_URLS.DELIVERIES_FEEDBACK_REPORT_EXPORTS + "?page=1";

        mockBackend.whenGET(url).respond(200, message);
        mockBackend.expectGET(url);

        reportService.exportDeliveriesFeedbackReport({}).then(function (response) {
            expect(response.message).toEqual(message.message);
        });
        mockBackend.flush();
    });


    it('should get export successfully message when export item feedback report', function () {
        var message = {'message': 'Generating CSV, you will be notified via email once it is done.'};
        var url = config.BACKEND_URLS.ITEM_FEEDBACK_REPORT_EXPORTS + "?page=1";

        mockBackend.whenGET(url).respond(200, message);
        mockBackend.expectGET(url);

        reportService.exportItemFeedbackReport({}).then(function (response) {
            expect(response.message).toEqual(message.message);
        });
        mockBackend.flush();
    });

});