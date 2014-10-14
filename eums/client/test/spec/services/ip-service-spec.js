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
        },
        {
            'Name': 'Transcultural Psychosocial',
            'City': 'Kampala'
        },
    ];
    beforeEach(function () {
        module('eums.ip');
        inject(function ($httpBackend, EumsConfig, IPService) {
            mockBackend = $httpBackend;
            IPJSONURL = EumsConfig.IPJSONURL;
            ipService = IPService;
            mockBackend.whenGET(IPJSONURL).respond(stubIPs);
        });
    });

    it('should get list of all IPs', function (done) {
        ipService.getAllIps().then(function (response) {
            expect(response.data).toEqual(stubIPs);
            done();
        });
        mockBackend.flush();
    });

    it('should group all IPs by district', function (done) {
        var district = 'kampala';
        ipService.groupIPsByDistrict(district).then(function (ips) {
            expect(ips).toEqual([
                { Name: 'Elizabeth Glaser Pediatric Aids', City: 'Kampala' },
                { Name: 'Transcultural Psychosocial', City: 'Kampala' }
            ]);
            done();
        });
        mockBackend.flush();
    });

//    xdescribe('District geometry mapping', function () {
//        var stubIPMapping = [
//            { Name: 'Elizabeth Glaser Pediatric Aids', City: 'Kampala', Lat: 1.123, Lng: 32.123 },
//            { Name: 'Isingiro District Local Government', City: 'Isingiro', Lat: 1.123, Lng: 32.123 },
//            {'Name': 'Transcultural Psychosocial', 'City': 'Kampala', Lat: 1.143, Lng: 32.023}
//        ];
//        it('should map ips to latitude and longitude', function () {
//            var ipWithGeometry = ipService.mapIPToGeometry(stubIPs);
//            expect(ipWithGeometry).toEqual(stubIPMapping);
//        });
//    });
});