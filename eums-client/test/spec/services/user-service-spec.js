describe('User Service', function () {

    var userService, mockBackend, userEndpointUrl, permissionEndpointUrl, retrievePermissionsUrl;

    beforeEach(function () {
        module('User');

        inject(function (UserService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            userEndpointUrl = EumsConfig.BACKEND_URLS.USER;
            permissionEndpointUrl = EumsConfig.BACKEND_URLS.PERMISSION;
            userService = UserService;
        });
    });

    it('should retrieve all permissions for a user', function (done) {
        var permissionsResponse = ['permission_one', 'permission_two'];
        mockBackend.whenGET(permissionEndpointUrl + '/all').respond(200, permissionsResponse);
        userService.retrieveUserPermissions().then(function (permissions) {
            expect(permissions).toEqual(permissionsResponse)
            done();
        });
        mockBackend.flush();
    });

    it('should be true if user permission exists', function (done) {
        mockBackend.whenGET(permissionEndpointUrl + '?permission=allowed_permission').respond(200, '');
        userService.checkUserPermission('allowed_permission').then(function (allowed) {
            expect(allowed).toEqual(true);
            done();
        });
        mockBackend.flush();
    });

    it('should be false if user permission does not exist', function (done) {
        mockBackend.whenGET(permissionEndpointUrl + '?permission=allowed_permission').respond(401, '');
        userService.checkUserPermission('allowed_permission').then(function (allowed) {
            expect(allowed).toEqual(false);
            done();
        });
        mockBackend.flush();
    });

    it('should get current user', function (done) {
        var fakeUser = {username: 'x'};
        mockBackend.whenGET('/api/current-user/').respond(200, fakeUser);
        userService.getCurrentUser().then(function (user) {
            expect(user).toEqual(fakeUser);
            done();
        });
        mockBackend.flush();
    });

    it('should cache current user', function (done) {
        var fakeUser = {username: 'x'};
        mockBackend.expectGET('/api/current-user/').respond(200, fakeUser);
        userService.getCurrentUser().then(function (user) {
            expect(user).toEqual(fakeUser);
            userService.getCurrentUser().then(function (user) {
                expect(user).toEqual(fakeUser);
                done();
            });
        });
        mockBackend.flush();
    });
});