describe('Programme Service', function() {
    var programmeService, mockBackend, endpointUrl, userEndpointUrl, mockUserService, scope;
    var programmeId = 1, focalPersonId = 1;

    var stubProgramme = {
        id: programmeId,
        name: 'Test Programme',
        focal_person: focalPersonId
    };
    var user = {
        id: focalPersonId,
        firstName: 'Musoke',
        lastName: 'Stephen'

    };


    beforeEach(function() {
        module('Programme');

        mockUserService = jasmine.createSpyObj('mockUserService', ['getUserById']);

        module(function($provide) {
            $provide.value('UserService', mockUserService);
        });

        inject(function(ProgrammeService, $httpBackend, EumsConfig, $q, $rootScope) {
            scope = $rootScope.$new();

            var deferred = $q.defer();
            deferred.resolve(user);
            mockUserService.getUserById.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.PROGRAMME;
            userEndpointUrl = EumsConfig.BACKEND_URLS.USER;
            programmeService = ProgrammeService;
        });
    });

    it('should know how to fetch all programmes', function(done) {
        mockBackend.whenGET(endpointUrl).respond([stubProgramme]);
        programmeService.fetchProgrammes().then(function(response) {
            expect(response.data).toEqual([stubProgramme]);
            done();
        });
        mockBackend.flush();
    });
});
