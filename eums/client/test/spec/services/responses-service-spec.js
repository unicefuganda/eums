describe('Responses Service', function () {
    var mockBackend, responsesService, config;
    var consigneeOneName = 'Name 1';
    var consigneeTwoName = 'Name 2';
    var consigneeThreeName = 'Name 3';
    var consigneeFourName = 'Name 3';

    var expectedResponses = {'node': consigneeOneName,
        'children': [
            {'node': consigneeThreeName,
                'children': [],
                'answers': {
                    'productReceived': 'UNCATEGORISED'}},
            {'node': consigneeTwoName,
                'children': [
                    {
                        'node': consigneeFourName,
                        'children': [],
                        'answers': {
                            'AmountReceived': '80'}}
                ],
                'answers': {'productReceived': 'UNCATEGORISED'}}
        ],
        'answers': {'AmountReceived': '80'}};

    beforeEach(function () {
        module('Responses');

        inject(function (ResponsesService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            responsesService = ResponsesService;
            config = EumsConfig;
        });
    });

    it('should get responses from backend', function (done) {
        var consigneeId = 1;
        var salesOrderItemId = 1;

        mockBackend.whenGET(config.BACKEND_URLS.DISTRIBUTION_PLAN_RESPONSES + consigneeId + '/sales_order_item_id/' + salesOrderItemId)
            .respond(expectedResponses);

        responsesService.fetchResponses(consigneeId, salesOrderItemId).then(function (responses) {
            expect(responses).toEqual(expectedResponses);
            done();
        });
        mockBackend.flush();
    });
});
