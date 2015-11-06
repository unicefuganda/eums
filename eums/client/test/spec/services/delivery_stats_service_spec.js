describe('DeliveryStatsService', function () {
    var mockBackend, deliveryStatsService, deliveryStatsDetailsEndpoint, mapDeliveryStatsEndpoint,
        latestDeliveriesEndpoint,
        fakeResponse = {message: 'some message'};
    beforeEach(function () {
        module('DeliveryStats');

        inject(function ($httpBackend, DeliveryStatsService, EumsConfig) {
            mockBackend = $httpBackend;
            deliveryStatsService = DeliveryStatsService;
            deliveryStatsDetailsEndpoint = EumsConfig.BACKEND_URLS.DELIVERY_STATS_DETAILS;
            mapDeliveryStatsEndpoint = EumsConfig.BACKEND_URLS.MAP_DELIVERY_STATS;
            latestDeliveriesEndpoint = EumsConfig.BACKEND_URLS.LATEST_DELIVERIES;
        })
    });

    it('should call delivery stats details endpoint', function () {
        mockBackend.whenGET(deliveryStatsDetailsEndpoint).respond(fakeResponse);
        deliveryStatsService.getStatsDetails().then(function (response) {
            expect(response.data).toEqual(fakeResponse)
        });
        mockBackend.flush();
    });

    it('should call map delivery stats endpoint', function () {
        mockBackend.whenGET(mapDeliveryStatsEndpoint).respond(fakeResponse);
        deliveryStatsService.getMapStats().then(function (response) {
            expect(response.data).toEqual(fakeResponse);
        });
        mockBackend.flush();
    });

    it('should call latest deliveries endpoint', function () {
        mockBackend.whenGET(latestDeliveriesEndpoint).respond(fakeResponse);
        deliveryStatsService.getLatestDeliveries().then(function (response) {
            expect(response.data).toEqual(fakeResponse);
        });
        mockBackend.flush();
    });

});