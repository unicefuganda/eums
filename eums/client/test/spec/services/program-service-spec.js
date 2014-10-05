describe('Programme Service', function() {

    var programmeService, mockBackend, programmeEndpointUrl;
    var programmeId = 1;

    var stubProgramme = {
            id: programmeId,
            name: 'Test Programme',
            focal_person: 1
        };

    beforeEach(function() {
        module('Programme');

        inject(function(ProgrammeService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            programmeEndpointUrl = EumsConfig.BACKEND_URLS.PROGRAMME;
            programmeService = ProgrammeService;
        });
    });

    it('should get programme details', function(done) {
        mockBackend.whenGET(programmeEndpointUrl + programmeId + '/').respond(stubProgramme);
        programmeService.getProgramme(programmeId).then(function(programme) {
            expect(programme).toEqual(stubProgramme);
            done();
        });
        mockBackend.flush();
    });

    it('should know how to fetch all programmes', function(done){
        mockBackend.whenGET(programmeEndpointUrl).respond([stubProgramme]);
        programmeService.fetchProgrammes().then(function (response) {
            expect(response.data).toEqual([stubProgramme]);
            done();
        });
        mockBackend.flush();
    });
});
