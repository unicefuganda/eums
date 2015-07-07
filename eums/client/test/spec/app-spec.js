describe('Route Provider', function () {
    var routes;

    beforeEach(function () {
        module('eums');

        inject(function ($route) {
            routes = $route;

        });
    });

    it('should have a home route', function () {
        expect((Object.keys(routes.routes))).toContain('/');
        expect(routes.routes['/'].controller).toBe('HomeController');
        expect(routes.routes['/'].templateUrl).toBe('/static/app/views/home.html');
    });

    it('should know reported by ip direct-delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/ip-direct-delivery');
        expect(routes.routes['/ip-direct-delivery'].controller).toBe('IPDirectDeliveryController');
        expect(routes.routes['/ip-direct-delivery'].templateUrl).toBe('/static/app/views/reported-by-ip/direct-delivery.html');
    });

    it('should know reported by ip warehouse-delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/ip-direct-delivery');
        expect(routes.routes['/ip-warehouse-delivery'].controller).toBe('IPWarehouseDeliveryController');
        expect(routes.routes['/ip-warehouse-delivery'].templateUrl).toBe('/static/app/views/reported-by-ip/warehouse-delivery.html');
    });

    it('should know new distribution plan route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/delivery-report/new/:purchaseOrderId');
        expect(routes.routes['/delivery-report/new/:purchaseOrderId'].controller).toBe('NewDistributionPlanController');
        expect(routes.routes['/delivery-report/new/:purchaseOrderId'].templateUrl).toBe('/static/app/views/distribution-planning/new.html');
    });

    it('should know distribution reporting route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/field-verification-reports');
        expect(routes.routes['/field-verification-reports'].controller).toBe('ManualReportingController');
        expect(routes.routes['/field-verification-reports'].templateUrl).toBe('/static/app/views/distribution-reporting/distribution-reporting.html');
    });

    it('should know responses page route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/response-details/:district');
        expect(routes.routes['/response-details/:district'].controller).toBe('ResponseController');
        expect(routes.routes['/response-details/:district'].templateUrl).toBe('/static/app/views/responses/index.html');
    });

    it('should know proceed distribution plan route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/delivery-report/proceed/');
        expect(routes.routes['/delivery-report/proceed/'].controller).toBe('NewDistributionPlanController');
        expect(routes.routes['/delivery-report/proceed/'].templateUrl).toBe('/static/app/views/distribution-planning/select-items.html');
    });

    it('should know distribution reporting details route exists for purchase order', function () {
        expect((Object.keys(routes.routes))).toContain('/field-verification-details/purchase-order/:purchaseOrderId');
        expect(routes.routes['/field-verification-details/purchase-order/:purchaseOrderId'].controller).toBe('ManualReportingDetailsController');
        expect(routes.routes['/field-verification-details/purchase-order/:purchaseOrderId'].templateUrl).toBe('/static/app/views/distribution-reporting/details.html');
    });

    it('should know distribution reporting details route exists for waybill', function () {
        expect((Object.keys(routes.routes))).toContain('/field-verification-details/waybill/:releaseOrderId');
        expect(routes.routes['/field-verification-details/waybill/:releaseOrderId'].controller).toBe('ManualReportingDetailsController');
        expect(routes.routes['/field-verification-details/waybill/:releaseOrderId'].templateUrl).toBe('/static/app/views/distribution-reporting/details.html');
    });

});