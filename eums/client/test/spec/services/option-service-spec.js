describe('Option Service', function() {

    var optionService, mockBackend, qualityOptionsEndpointUrl;

    beforeEach(function() {
        module('Option');

        inject(function(OptionService, $httpBackend, EumsConfig) {
            mockBackend = $httpBackend;
            qualityOptionsEndpointUrl = EumsConfig.BACKEND_URLS.QUALITY_OPTIONS;
            optionService = OptionService;
        });
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
});
