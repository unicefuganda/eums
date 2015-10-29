describe('DeliveryStatsService', function () {
    var mockBackend, deliveryStatsService, deliveryStatsEndpoint, ipDeliveryStatsEndpoint,
        fakeResponse = {message: 'some message'};
    beforeEach(function () {
        module('DeliveryStats');

        inject(function ($httpBackend, DeliveryStatsService, EumsConfig) {
            mockBackend = $httpBackend;
            deliveryStatsService = DeliveryStatsService;
            deliveryStatsEndpoint = EumsConfig.BACKEND_URLS.DELIVERY_STATS_DETAILS;
            ipDeliveryStatsEndpoint = EumsConfig.BACKEND_URLS.IP_DELIVERY_STATS;
        })
    });

    it('should call delivery stats endpoint', function () {
        mockBackend.whenGET(deliveryStatsEndpoint).respond(fakeResponse);
        deliveryStatsService.getStats().then(function (response) {
            expect(response.data).toEqual(fakeResponse)
        });
        mockBackend.flush();
    });

    it('should call ip delivery stats endpoint', function () {
        mockBackend.whenGET(ipDeliveryStatsEndpoint).respond(fakeResponse);
        deliveryStatsService.getIpStats().then(function (response) {
            expect(response.data).toEqual(fakeResponse);
        });
        mockBackend.flush();
    });

});