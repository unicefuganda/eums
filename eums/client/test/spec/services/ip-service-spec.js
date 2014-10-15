describe('IP Service', function () {
    var IPJSONURL, DISTRICTJSONURL, mockBackend, ipService;
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

    var stubDistricts = ['Kampala','Isingiro'];

    beforeEach(function () {
        module('eums.ip');
        inject(function ($httpBackend, EumsConfig, IPService) {
            mockBackend = $httpBackend;
            IPJSONURL = EumsConfig.IPJSONURL;
            DISTRICTJSONURL = EumsConfig.DISTRICTJSONURL;
            ipService = IPService;
            mockBackend.whenGET(IPJSONURL).respond(stubIPs);
            mockBackend.whenGET(DISTRICTJSONURL).respond(stubDistricts);
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
        ipService.groupAllIPsByDistrict().then(function (groups) {
            expect(groups).toEqual([
                [
                    { Name: 'Elizabeth Glaser Pediatric Aids', City: 'Kampala' },
                    { Name: 'Transcultural Psychosocial', City: 'Kampala' }
                ],
                [
                    { Name: 'Isingiro District Local Government', City: 'Isingiro'  }
                ]
            ]);
            done();
        });
        mockBackend.flush();
    });

});

