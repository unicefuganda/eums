describe('Programme Service', function() {

    var programmeService, mockBackend, programmeEndpointUrl, userEndpointUrl;
    var programmeId = 1, focalPersonId = 1;

    var stubProgramme = {
        id: programmeId,
        name: 'Test Programme',
        focal_person: focalPersonId
    };

    var fullProgramme = {
        id: stubProgramme.id,
        name: stubProgramme.name,
        focal_person: {
            id: focalPersonId,
            firstName: 'Musoke',
            lastName: 'Stephen'

        }
    };

    beforeEach(function() {
        module('Programme');

        inject(function(ProgrammeService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            programmeEndpointUrl = EumsConfig.BACKEND_URLS.PROGRAMME;
            userEndpointUrl = EumsConfig.BACKEND_URLS.USER;
            programmeService = ProgrammeService;
        });
    });

    it('should get programme details', function(done) {
        mockBackend.whenGET(userEndpointUrl + focalPersonId + '/').respond(fullProgramme.focal_person);
        programmeService.getProgrammeDetails(stubProgramme).then(function(programme) {
            expect(programme).toEqual(fullProgramme);
            done();
        });
        mockBackend.flush();
    });

    it('should know how to fetch all programmes', function(done) {
        mockBackend.whenGET(programmeEndpointUrl).respond([stubProgramme]);
        programmeService.fetchProgrammes().then(function(response) {
            expect(response.data).toEqual([stubProgramme]);
            done();
        });
        mockBackend.flush();
    });
});
