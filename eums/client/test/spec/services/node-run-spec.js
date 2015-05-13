describe('Node Run Service', function () {

    var nodeRunService, mockBackend, nodeRunEndpointUrl;

    var stubNodeRun = {
        scheduled_message_task_id: '33hd762',
        node: 1,
        status: 'completed',
        phone: '+256783123456'
    };

    var expectedNodeRun = stubNodeRun;
    expectedNodeRun.id = 1;

    beforeEach(function () {
        module('NodeRun');

        inject(function (NodeRunService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            nodeRunEndpointUrl = EumsConfig.BACKEND_URLS.NODE_RUN;
            nodeRunService = NodeRunService;
        });

        mockBackend.whenPOST(nodeRunEndpointUrl, stubNodeRun).respond(expectedNodeRun);
    });

    it('should add node run', function (done) {
        nodeRunService.createNodeRun(stubNodeRun).then(function (returnedNodeRun) {
            expect(returnedNodeRun).toEqual(expectedNodeRun);
            done();
        });
        mockBackend.flush();
    });
});

