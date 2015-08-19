describe('AlertsService', function () {

    var mockServiceFactory, config;

    beforeEach(function () {

        module('Alerts');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);

        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
        });

        inject(function (AlertsService, EumsConfig) {
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
        });
    });

    it('should delegate down to service factory with correct url', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.ALERTS
        });
    });
});