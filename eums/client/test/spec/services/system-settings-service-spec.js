describe('System Setting Service', function () {

    var SystemSettingsService, mockBackend, runEndpointUrl;

    var currentAutoTrack = [{"id":1,"auto_track":false}],
        stubAutoTrack = true,
        expectedAutoTrack = {"auto_track": stubAutoTrack};

    beforeEach(function () {
        module('SystemSettingsService');

        inject(function (_SystemSettingsService_, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            runEndpointUrl = EumsConfig.BACKEND_URLS.SYSTEM_SETTINGS;
            SystemSettingsService = _SystemSettingsService_;
        });

        mockBackend.whenGET(runEndpointUrl).respond(currentAutoTrack);
        mockBackend.whenPUT(runEndpointUrl + '/1', expectedAutoTrack).respond(expectedAutoTrack);
    });

    it('should get auto track status correctly', function (done) {
        SystemSettingsService.isAutoTrack().then(function (currentStatus) {
            expect(currentStatus).toEqual(false);
            done();
        });
        mockBackend.flush();
    });

    it('should update auto track status correctly', function (done) {
        SystemSettingsService.updateAutoTrack(stubAutoTrack).then(function (response) {
            expect(response.data.auto_track).toEqual(stubAutoTrack);
            done();
        });
        mockBackend.flush();
    });
});

