describe('Release Order Service', function () {

    var releaseOrderService,
        mockBackend,
        endpointUrl,
        scope,
        stubReleaseOrder,
        stubReleaseOrders,
        orderId = 1,
        programmeOneId = 1;

    beforeEach(function () {
        module('ReleaseOrder');

        stubReleaseOrder = {
            id: 1,
            order_number: orderId,
            delivery_date: '2014-10-06',
            description: 'Midwife Supplies',
            consignee: 1,
            waybill: 1,
            sales_order: 1,
            releaseorderitem_set: [1, 2],
            programme: programmeOneId
        };
        stubReleaseOrders = [
            stubReleaseOrder,
            {
                id: 2,
                order_number: 2,
                delivery_date: '2014-09-20',
                description: 'Books',
                consignee: 2,
                waybill: 2,
                sales_order: 2,
                releaseorderitem_set: [3, 4],
                programme: 2
            }
        ];

        inject(function (ReleaseOrderService, $httpBackend, EumsConfig, $q, $rootScope) {
            scope = $rootScope.$new();

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.RELEASE_ORDER;
            releaseOrderService = ReleaseOrderService;
        });
    });

    it('should get all release orders', function (done) {
        mockBackend.whenGET(endpointUrl).respond(stubReleaseOrders);

        releaseOrderService.getReleaseOrders().then(function (orders) {
            expect(orders).toEqual(stubReleaseOrders);
            done();
        });
        mockBackend.flush();
    });

    it('should get release order by its id', function (done) {
        mockBackend.whenGET(endpointUrl + stubReleaseOrder.id).respond(stubReleaseOrder);

        releaseOrderService.getReleaseOrder(stubReleaseOrder.id).then(function (releaseOrderDetails) {
            expect(releaseOrderDetails).toEqual(stubReleaseOrder);
            done();
        });
        mockBackend.flush();
    });
});
