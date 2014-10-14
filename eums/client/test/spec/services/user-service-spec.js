describe('User Service', function () {

    var userService, mockBackend, userEndpointUrl;

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
            userService = UserService;
        });
    });

    it('should get user as contact person', function (done) {
        mockBackend.whenGET(userEndpointUrl + userId + '/').respond(stubUser);
        userService.getUserByIdAsProgrammeFocal(userId).then(function (returnedUser) {
            expect(returnedUser).toEqual(expectedUser);
            done();
        });
        mockBackend.flush();
    });
});
