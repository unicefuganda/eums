describe('Programme Service', function () {
    var programmeService, mockBackend, endpointUrl, userEndpointUrl, scope;
    var programmeId = 1;

    var stubProgramme = {
        id: programmeId,
        name: 'Test Programme'
    };


    beforeEach(function () {
        module('Programme');

        inject(function (ProgrammeService, $httpBackend, EumsConfig, $q, $rootScope) {
            scope = $rootScope.$new();

            mockBackend = $httpBackend;
            endpointUrl = EumsConfig.BACKEND_URLS.PROGRAMME;
            userEndpointUrl = EumsConfig.BACKEND_URLS.USER;
            programmeService = ProgrammeService;
        });
    });

    it('should know how to fetch all programmes', function (done) {
        mockBackend.whenGET(endpointUrl).respond([stubProgramme]);
        programmeService.fetchProgrammes().then(function (response) {
            expect(response.data).toEqual([stubProgramme]);
            done();
        });
        mockBackend.flush();
    });

    it('should get a programme by its id', function (done) {
        mockBackend.whenGET(endpointUrl + stubProgramme.id + '/').respond(stubProgramme);
        programmeService.getProgrammeDetails(stubProgramme.id).then(function (programmeDetails) {
            expect(programmeDetails).toEqual(stubProgramme);
            done();
        });
        mockBackend.flush();
    });
});
