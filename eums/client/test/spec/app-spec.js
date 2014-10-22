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

    it('should know distribution plan route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/distribution-planning');
        expect(routes.routes['/distribution-planning'].controller).toBe('DistributionPlanController');
        expect(routes.routes['/distribution-planning'].templateUrl).toBe('/static/app/views/distribution-planning/distribution-planning.html');
    });

    it('should know new distribution plan route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/distribution-plan/new/:salesOrderId');
        expect(routes.routes['/distribution-plan/new/:salesOrderId'].controller).toBe('NewDistributionPlanController');
        expect(routes.routes['/distribution-plan/new/:salesOrderId'].templateUrl).toBe('/static/app/views/distribution-planning/new.html');
    });

    it('should know proceed distribution plan route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/distribution-plan/proceed/');
        expect(routes.routes['/distribution-plan/proceed/'].controller).toBe('NewDistributionPlanController');
        expect(routes.routes['/distribution-plan/proceed/'].templateUrl).toBe('/static/app/views/distribution-planning/select-items.html');
    });

    it('should know distribution reporting route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/distribution-reporting');
        expect(routes.routes['/distribution-reporting'].controller).toBe('ManualReportingController');
        expect(routes.routes['/distribution-reporting'].templateUrl).toBe('/static/app/views/distribution-reporting/distribution-reporting.html');
    });

    it('should know distribution reporting details route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/distribution-reporting/details');
        expect(routes.routes['/distribution-reporting/details'].controller).toBe('ManualReportingController');
        expect(routes.routes['/distribution-reporting/details'].templateUrl).toBe('/static/app/views/distribution-reporting/details.html');
    });

});