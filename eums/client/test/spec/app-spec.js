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

    it('should have a know ditrict zoom route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/:district');
        expect(routes.routes['/'].controller).toBe('HomeController');
        expect(routes.routes['/'].templateUrl).toBe('/static/app/views/home.html');
    });

    it('should know distribution plan route exists', function () {
        expect((Object.keys(routes.routes))).toContain('/distribution-planning');
        expect(routes.routes['/distribution-planning'].controller).toBe('DistributionPlanController');
        expect(routes.routes['/distribution-planning'].templateUrl).toBe('/static/app/views/distribution-planning/distribution-planning.html');
    });

});