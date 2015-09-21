describe('DeliveryStatsService', function () {
    var mockBackend, deliveryStatsService, deliveryStatsEndpoint,
        fakeResponse = {message: 'some message'};
    beforeEach(function () {
        module('DeliveryStats');
        inject(function ($httpBackend, DeliveryStatsService, EumsConfig) {
            mockBackend = $httpBackend;
            deliveryStatsService = DeliveryStatsService;
            deliveryStatsEndpoint = EumsConfig.BACKEND_URLS.DELIVERY_STATS;
        })
    });

    it('should call delivery stats endpoint', function(){
        mockBackend.whenGET(deliveryStatsEndpoint).respond(fakeResponse);
        deliveryStatsService.getStats().then(function(response){
            expect(response).toEqual(fakeResponse)
        });
    });
});