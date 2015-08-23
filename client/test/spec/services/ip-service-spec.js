describe('IP Service', function () {
    var DISTRICTJSONURL, mockBackend, ipService;

    var stubDistricts = ['Kampala','Isingiro'];

    beforeEach(function () {
        module('eums.ip');
        inject(function ($httpBackend, EumsConfig, IPService) {
            mockBackend = $httpBackend;
            DISTRICTJSONURL = EumsConfig.DISTRICTJSONURL;
            ipService = IPService;
            mockBackend.whenGET(DISTRICTJSONURL).respond(stubDistricts);
        });
    });

    it('should load all Districts', function (done) {
        ipService.loadAllDistricts().then(function (response) {
            expect(response.data).toEqual(stubDistricts);
            done();
        });
        mockBackend.flush();
    });
});

