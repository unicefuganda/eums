describe('IP Service', function () {
    var IPJSONURL, mockBackend, ipService;
    var stubIPs = [
        {
            'Name': 'Elizabeth Glaser Pediatric Aids',
            'City': 'Kampala'
        },
        {
            'Name': 'Isingiro District Local Government',
            'City': 'Isingiro'
        }
    ];
    beforeEach(function () {
        module('eums.ip');

        inject(function ($httpBackend, EumsConfig, IPService) {
            mockBackend = $httpBackend;
            IPJSONURL = EumsConfig.IPJSONURL;
            ipService = IPService;
        });
    });

    it('should get list of all IPs', function (done) {
        mockBackend.whenGET(IPJSONURL).respond(stubIPs);
        ipService.getAllIps().then(function (response) {
            expect(response.data).toEqual(stubIPs);
            done();
        });
        mockBackend.flush();
    });
});