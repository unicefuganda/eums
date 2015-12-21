describe('SystemSettings Service', function () {

    var config, mockBackend, systemSettingsService;

    beforeEach(function () {
        module('SystemSettingsService');

        inject(function (SystemSettingsService, $httpBackend, $q, EumsConfig, $http) {
            q = $q;
            http = $http;
            config = EumsConfig;

            mockBackend = $httpBackend;
            systemSettingsService = SystemSettingsService;
        });
    });

    it('should get system settings', function () {
        var systemSettings = [{id: 1, auto_track: true, sync_start_date: '2015-12-06T00:00:00'}];
        var url = config.BACKEND_URLS.SYSTEM_SETTINGS;

        mockBackend.whenGET(url).respond(200, systemSettings);
        mockBackend.expectGET(url);

        systemSettingsService.getSettings().then(function (response) {
            expect(response).toEqual(systemSettings[0]);
        });
        mockBackend.flush();
    });

    it('should update system settings', function () {
        var systemSettings = {auto_track: true, sync_start_date: '2015-12-07T00:00:00'};
        var url = config.BACKEND_URLS.SYSTEM_SETTINGS + '/1';

        mockBackend.whenPUT(url).respond(200, systemSettings);
        mockBackend.expectPUT(url);

        systemSettingsService.updateSettings(systemSettings).then(function (response) {
            expect(response.data).toEqual(systemSettings);
        });
        mockBackend.flush();
    });
});