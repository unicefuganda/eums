describe('Node Run Service', function () {

    var runService, mockBackend, runEndpointUrl;

    var stubRun = {
        scheduled_message_task_id: '33hd762',
        node: 1,
        status: 'completed',
        phone: '+256783123456'
    };

    var expectedRun = stubRun;
    expectedRun.id = 1;

    beforeEach(function () {
        module('Run');

        inject(function (RunService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            runEndpointUrl = EumsConfig.BACKEND_URLS.RUN;
            runService = RunService;
        });

        mockBackend.whenPOST(runEndpointUrl, stubRun).respond(expectedRun);
    });

    it('should add node run', function (done) {
        runService.createRun(stubRun).then(function (returnedRun) {
            expect(returnedRun).toEqual(expectedRun);
            done();
        });
        mockBackend.flush();
    });
});

