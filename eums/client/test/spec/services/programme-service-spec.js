describe('Programme Service', function () {
    var mockServiceFactory, config;

    beforeEach(function () {
        module('Programme');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);
        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
        });
        inject(function (ProgrammeService, EumsConfig) {
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
        });
    });

    it('should create itself with the right parameters', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.PROGRAMME,
            methods: jasmine.any(Object)
        });
    });
});
