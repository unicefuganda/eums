describe('Option Service', function() {

    var optionService, mockBackend, receivedOptionsEndpointUrl, qualityOptionsEndpointUrl, satisfiedOptionsEndpointUrl;

    beforeEach(function() {
        module('Option');

        inject(function(OptionService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            receivedOptionsEndpointUrl = EumsConfig.BACKEND_URLS.RECEIVED_OPTIONS;
            qualityOptionsEndpointUrl = EumsConfig.BACKEND_URLS.QUALITY_OPTIONS;
            satisfiedOptionsEndpointUrl = EumsConfig.BACKEND_URLS.SATISFIED_OPTIONS;
            optionService = OptionService;
        });
    });

    it('should know how to fetch all received responses options', function (done) {
        var stubOption = {
            id: 1,
            name: 'Received Option 1'
        };

        mockBackend.whenGET(receivedOptionsEndpointUrl).respond([stubOption]);
        optionService.receivedOptions().then(function (response) {
            expect(response).toEqual([stubOption]);
            done();
        });
        mockBackend.flush();
    });

    it('should know how to fetch all quality responses options', function (done) {
        var stubOption = {
            id: 1,
            name: 'Quality Option 1'
        };

        mockBackend.whenGET(qualityOptionsEndpointUrl).respond([stubOption]);
        optionService.qualityOptions().then(function (response) {
            expect(response).toEqual([stubOption]);
            done();
        });
        mockBackend.flush();
    });

    it('should know how to fetch all satisfied responses options', function (done) {
        var stubOption = {
            id: 1,
            name: 'Satisfied Option 1'
        };

        mockBackend.whenGET(satisfiedOptionsEndpointUrl).respond([stubOption]);
        optionService.satisfiedOptions().then(function (response) {
            expect(response).toEqual([stubOption]);
            done();
        });
        mockBackend.flush();
    });
});
