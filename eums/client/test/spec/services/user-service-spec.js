describe('User Service', function () {

    var userService, mockBackend, userEndpointUrl, permissionEndpointUrl;

    var userId = 1;

    var stubUser = {
        id: userId,
        username: 'Save the Children',
        first_name: 'Musoke',
        last_name: 'Stephen',
        email: 'sms@thw.com'
    };

    var expectedUser = {
        id: userId,
        firstName: 'Musoke',
        lastName: 'Stephen'
    };

    beforeEach(function () {
        module('User');

        inject(function (UserService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            userEndpointUrl = EumsConfig.BACKEND_URLS.USER;
            permissionEndpointUrl = EumsConfig.BACKEND_URLS.PERMISSION;
            userService = UserService;
        });
    });

    it('should get user by id', function (done) {
        mockBackend.whenGET(userEndpointUrl + userId + '/').respond(stubUser);
        userService.getUserById(userId).then(function (returnedUser) {
            expect(returnedUser).toEqual(expectedUser);
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
        mockBackend.whenGET(permissionEndpointUrl + '?permission=allowed_permission').respond(401,'');
        userService.checkUserPermission('allowed_permission').then(function (allowed) {
            expect(allowed).toEqual(false);
            done();
        });
        mockBackend.flush();
    });
});
