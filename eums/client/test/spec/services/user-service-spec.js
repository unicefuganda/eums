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

    describe('when retrieve-user-permissions', function () {
        it('should retrieve all permissions for a user', function (done) {
            var permissionsResponse = ['permission_one', 'permission_two'];
            mockBackend.whenGET(permissionEndpointUrl + '/all').respond(200, permissionsResponse);
            userService.retrieveUserPermissions().then(function (permissions) {
                expect(permissions).toEqual(permissionsResponse)
                done();
            });
            mockBackend.flush();
        });
    });

    describe('when check-user-permission', function () {
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
    });

    describe('when get user', function () {
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
                done();
            });
            mockBackend.flush();
        });

        it('should get user by id', function (done) {
            var userId = 1;
            var fakeUser = {
                id: userId,
                username: 'Sam'
            };
            mockBackend.expectGET('/api/user/' + userId).respond(200, fakeUser);

            userService.getUserById(userId).then(function (user) {
                expect(user).toEqual(fakeUser);
                done();
            });
            mockBackend.flush();
        });
    });

    describe('when checking has-permission', function () {
        it('should return back true when first permission in list exists for user', function () {
            var fakePermissions = ['permission_one', 'permission_two'];
            mockBackend.expectGET('/api/permission/all').respond(200, fakePermissions);
            userService.hasPermission('permission_one').then(function (checkResult) {
                expect(checkResult).toBeTruthy();
            });
            mockBackend.flush();
        });

        it('should return back true when second permission in list exists for user', function () {
            var fakePermissions = ['permission_one', 'permission_two'];
            mockBackend.expectGET('/api/permission/all').respond(200, fakePermissions);
            userService.hasPermission('permission_two').then(function (checkResult) {
                expect(checkResult).toBeTruthy();
            });
            mockBackend.flush();
        });

        it('should return back false when permissions do not exist for user', function () {
            var fakePermissions = ['permission_one', 'permission_two'];
            mockBackend.expectGET('/api/permission/all').respond(200, fakePermissions);
            userService.hasPermission('permission_three').then(function (checkResult) {
                expect(checkResult).toBeFalsy();
            });
            mockBackend.flush();
        });

        it('should return back false when scope permissions is empty', function () {
            var fakePermissions = [];
            mockBackend.expectGET('/api/permission/all').respond(200, fakePermissions);
            userService.hasPermission('some_permission').then(function (checkResult) {
                expect(checkResult).toBeFalsy();
            });
            mockBackend.flush();
        });

        it('should return back false when scope permissions is undefined', function () {
            var fakePermissions = undefined;
            mockBackend.expectGET('/api/permission/all').respond(200, fakePermissions);
            userService.hasPermission('some_permission').then(function (checkResult) {
                expect(checkResult).toBeFalsy();
            });
            mockBackend.flush();
        });

        it('should return back false when permission to check is undefined', function () {
            userService.hasPermission(undefined).then(function (checkResult) {
                expect(checkResult).toBeFalsy();
            });
        });

        it('should return back true when first permission in list exists, and user-permission-list is provided', function () {
            var fakePermissions = ['permission_one', 'permission_two'];
            userService.hasPermission('permission_one', fakePermissions).then(function (checkResult) {
                expect(checkResult).toBeTruthy();
            });
        });
    });

});
