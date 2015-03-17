describe('Node Line Item Run Service', function () {

    var nodeLineItemRunService, mockBackend, nodeLineItemRunEndpointUrl;

    var stubNodeLineItemRun = {
        scheduled_message_task_id: '33hd762',
        node_line_item: 1,
        status: 'completed',
        phone: '+256783123456'
    };

    var expectedNodeLineItemRun = stubNodeLineItemRun;
    expectedNodeLineItemRun.id = 1;

    beforeEach(function () {
        module('NodeLineItemRun');

        inject(function (NodeLineItemRunService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            nodeLineItemRunEndpointUrl = EumsConfig.BACKEND_URLS.NODE_LINE_ITEM_RUN;
            nodeLineItemRunService = NodeLineItemRunService;
        });

        mockBackend.whenPOST(nodeLineItemRunEndpointUrl, stubNodeLineItemRun).respond(expectedNodeLineItemRun);
    });

    it('should add node line item run', function (done) {
        nodeLineItemRunService.createNodeLineItemRun(stubNodeLineItemRun).then(function (returnedNodeLineItemRun) {
            expect(returnedNodeLineItemRun).toEqual(expectedNodeLineItemRun);
            done();
        });
        mockBackend.flush();
    });
});

