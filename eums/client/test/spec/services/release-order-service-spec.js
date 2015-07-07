describe('Release Order Service', function () {

    var releaseOrderService, releaseOrderEndpoint, mockBackend;

    beforeEach(function () {
        module('ReleaseOrder');

        inject(function (ReleaseOrderService, EumsConfig, $httpBackend) {
            mockBackend = $httpBackend;
            releaseOrderService = ReleaseOrderService;
            releaseOrderEndpoint = EumsConfig.BACKEND_URLS.RELEASE_ORDER;
        });
    });

    it('should return release orders for a user who is an IP', function (done) {
        var ipUser = {consignee_id: 10};
        mockBackend.whenGET(releaseOrderEndpoint + '?consignee=10').respond([{id: 11}]);
        releaseOrderService.forUser(ipUser).then(function (orders) {
            expect(orders).toEqual([{id: 11}]);
            done();
        });
        mockBackend.flush();
    });
});