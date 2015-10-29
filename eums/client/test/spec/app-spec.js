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

    it('should know direct delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/direct-delivery');
        expect(routes.routes['/direct-delivery'].controller).toBe('DirectDeliveryController');
        expect(routes.routes['/direct-delivery'].templateUrl).toBe('/static/app/views/delivery/direct-delivery.html');
    });

    it('should know new direct delivery, select purchase order type route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/direct-delivery/new/:purchaseOrderId/multiple');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/multiple'].controller).toBe('MultipleIpDirectDeliveryController');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/multiple'].templateUrl).toBe('/static/app/views/delivery/multiple-ip-direct-delivery.html');
    });

    it('should know new direct delivery, select purchase order item route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/direct-delivery/new/:purchaseOrderId/multiple/:purchaseOrderItemId');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/multiple/:purchaseOrderItemId'].controller).toBe('MultipleIpDirectDeliveryController');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/multiple/:purchaseOrderItemId'].templateUrl).toBe('/static/app/views/delivery/multiple-ip-direct-delivery.html');
    });

    it('should know warehouse-delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/warehouse-delivery');
        expect(routes.routes['/warehouse-delivery'].controller).toBe('WarehouseDeliveryController');
        expect(routes.routes['/warehouse-delivery'].templateUrl).toBe('/static/app/views/delivery/warehouse-delivery.html');
    });

    it('should know new warehouse delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/warehouse-delivery/new/:releaseOrderId');
        expect(routes.routes['/warehouse-delivery/new/:releaseOrderId'].controller).toBe('WarehouseDeliveryManagementController');
        expect(routes.routes['/warehouse-delivery/new/:releaseOrderId'].templateUrl).toBe('/static/app/views/delivery/warehouse-delivery-management.html');
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

    it('should have a consignees route', function () {
        expect((Object.keys(routes.routes))).toContain('/consignees');
        expect(routes.routes['/consignees'].controller).toBe('ConsigneesController');
        expect(routes.routes['/consignees'].templateUrl).toBe('/static/app/views/consignees/consignees.html');
    });

    it('should route to single ip direct delivery controller for single delivery to one IP', function () {
        var route = '/direct-delivery/new/:purchaseOrderId/single';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('SingleIpDirectDeliveryController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/delivery/single-ip-direct-delivery.html');
    });
    it('should route to ip deliveries page', function () {
        var route = '/ip-deliveries';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('IpDeliveryController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/delivery/ip-delivery/delivery.html');
    });
    it('should have ip item list route pointing to the right controller', function () {
        var route = '/ip-items';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('IpItemsController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/delivery/ip-items.html');
    });
    it('should have ip delivery item list route pointing to the right controller', function () {
        var route = '/items-delivered-to-ip/:activeDeliveryId';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('ItemsDeliveredToIpController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/delivery/ip-delivery/items-delivered-to-ip.html');
    });

    it('should have deliveries for item route', function () {
        var route = '/deliveries-by-ip/:itemId';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('DeliveriesByIpController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/delivery/ip-delivery/deliveries-by-ip.html');
    });

    it('should have new delivery by ip route', function () {
        var route = '/deliveries-by-ip/:itemId/new';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('NewDeliveryByIpController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/delivery/ip-delivery/new-delivery-by-ip.html');
    });

    it('should have new sub-consignee delivery by ip route', function () {
        var route = '/deliveries-by-ip/:itemId/:parentNodeId/new';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('NewSubConsigneeDeliveryByIpController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/delivery/ip-delivery/new-sub-consignee-delivery-by-ip.html');
    });

    it('should have ip feedback report route pointing to the right controller', function () {
        var route = '/ip-feedback-report-by-item';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('IpFeedbackReportByItemController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/reports/ip-feedback-report-by-item.html');
    });
    it('should have ip feedback report by delivery route pointing to the right controller', function () {
        var route = '/ip-feedback-report-by-delivery';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('IpFeedbackReportByDeliveryController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/reports/ip-feedback-report-by-delivery.html');
    });

    it('should have end user feedback report route pointing to the right controller', function () {
        var route = '/end-user-feedback-report';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('EndUserFeedbackReportController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/reports/end-user-feedback-report.html');
    });

    it('should have Stock report route pointing to the right controller', function () {
        var route = '/stock-report';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('StockReportController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/reports/stock-report.html');
    });

    it('should have supply efficiency report route pointing to the right controller', function () {
        var route = '/supply-efficiency-report';
        expect((Object.keys(routes.routes))).toContain(route);
        expect(routes.routes[route].controller).toBe('SupplyEfficiencyReportController');
        expect(routes.routes[route].templateUrl).toBe('/static/app/views/reports/supply-efficiency-report.html');
    });
});