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
        expect(routes.routes['/direct-delivery'].templateUrl).toBe('/static/app/views/distribution-planning/direct-delivery.html');
    });

    it('should know new direct delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/direct-delivery/new/:purchaseOrderId');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId'].controller).toBe('DirectDeliveryManagementController');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId'].templateUrl).toBe('/static/app/views/distribution-planning/direct-delivery-management.html');
    });

    it('should know new direct delivery, select purchase order type route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/direct-delivery/new/:purchaseOrderId/:purchaseOrderType');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/:purchaseOrderType'].controller).toBe('DirectDeliveryManagementController');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/:purchaseOrderType'].templateUrl).toBe('/static/app/views/distribution-planning/direct-delivery-management.html');
    });

    it('should know new direct delivery, select purchase order item route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/direct-delivery/new/:purchaseOrderId/:purchaseOrderType/:purchaseOrderItemId');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/:purchaseOrderType/:purchaseOrderItemId'].controller).toBe('DirectDeliveryManagementController');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/:purchaseOrderType/:purchaseOrderItemId'].templateUrl).toBe('/static/app/views/distribution-planning/direct-delivery-management.html');
    });

    it('should know new direct delivery - multiple ip, select purchase order item, and select delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/direct-delivery/new/:purchaseOrderId/:purchaseOrderType/:purchaseOrderItemId/:deliveryNodeId');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/:purchaseOrderType/:purchaseOrderItemId/:deliveryNodeId'].controller).toBe('DirectDeliveryManagementController');
        expect(routes.routes['/direct-delivery/new/:purchaseOrderId/:purchaseOrderType/:purchaseOrderItemId/:deliveryNodeId'].templateUrl).toBe('/static/app/views/distribution-planning/direct-delivery-management.html');
    });

    it('should know warehouse-delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/warehouse-delivery');
        expect(routes.routes['/warehouse-delivery'].controller).toBe('WarehouseDeliveryController');
        expect(routes.routes['/warehouse-delivery'].templateUrl).toBe('/static/app/views/distribution-planning/warehouse-delivery.html');
    });

    it('should know new warehouse delivery route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/warehouse-delivery/new/:releaseOrderId');
        expect(routes.routes['/warehouse-delivery/new/:releaseOrderId'].controller).toBe('WarehouseDeliveryManagementController');
        expect(routes.routes['/warehouse-delivery/new/:releaseOrderId'].templateUrl).toBe('/static/app/views/distribution-planning/warehouse-delivery-management.html');
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

    it('should know new ip warehouse delivery report route exists', function(){
        expect(Object.keys(routes.routes)).toContain('/ip-warehouse-delivery/new/:releaseOrderId');
        expect(routes.routes['/ip-warehouse-delivery/new/:releaseOrderId'].controller).toBe('IPWarehouseDeliveryManagementController');
        expect(routes.routes['/ip-warehouse-delivery/new/:releaseOrderId'].templateUrl).toBe('/static/app/views/reported-by-ip/new-ip-warehouse-delivery-report.html');
    });

    it('should know new ip warehouse delivery report with release order item Id route exists', function(){
        expect(Object.keys(routes.routes)).toContain('/ip-warehouse-delivery/new/:releaseOrderId/:releaseOrderItemId');
        expect(routes.routes['/ip-warehouse-delivery/new/:releaseOrderId/:releaseOrderItemId'].controller).toBe('IPWarehouseDeliveryManagementController');
        expect(routes.routes['/ip-warehouse-delivery/new/:releaseOrderId/:releaseOrderItemId'].templateUrl).toBe('/static/app/views/reported-by-ip/new-ip-warehouse-delivery-report.html');
    });

    it('should know new ip warehouse delivery report with release order item Id and delivery node Id route exists', function(){
        expect(Object.keys(routes.routes)).toContain('/ip-warehouse-delivery/new/:releaseOrderId/:releaseOrderItemId/:deliveryNodeId');
        expect(routes.routes['/ip-warehouse-delivery/new/:releaseOrderId/:releaseOrderItemId/:deliveryNodeId'].controller).toBe('IPWarehouseDeliveryManagementController');
        expect(routes.routes['/ip-warehouse-delivery/new/:releaseOrderId/:releaseOrderItemId/:deliveryNodeId'].templateUrl).toBe('/static/app/views/reported-by-ip/new-ip-warehouse-delivery-report.html');
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

    it('should have a consignees route', function () {
        expect((Object.keys(routes.routes))).toContain('/consignees');
        expect(routes.routes['/consignees'].controller).toBe('ConsigneesController');
        expect(routes.routes['/consignees'].templateUrl).toBe('/static/app/views/consignees/consignees.html');
    });
});