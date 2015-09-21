describe('DeliveryStatsService', function () {

    var mockServiceFactory, config;

    beforeEach(function () {

        module('DeliveryStats');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);

        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
        });

        inject(function (DeliveryStatsService, EumsConfig) {
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
        });
    });

    it('should delegate down to service factory with correct url', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.DELIVERY_STATS,
        });
    });
});