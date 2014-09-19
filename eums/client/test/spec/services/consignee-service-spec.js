describe('Consignee Service', function() {

    var consigneeService, mockBackend, consigneeEndpointUrl, mockContactService;

    var consigneeId = 1;

    var contactPersonId = 1;

    var stubConsignee = {
        id: consigneeId,
        name: 'Save the Children',
        contact_person_id: 1
    };

    var fullContactResponse = {
        data: {
            id: contactPersonId, firstName: 'Andrew',
            lastName: "Mukiza", phone: '+234778945674'
        }
    };

    var expectedConsignee = {
        id: consigneeId,
        name: 'Save the Children',
        contactPerson: fullContactResponse.data
    };

    beforeEach(function() {
        module('Consignee');

        mockContactService = jasmine.createSpyObj('mockContactService', ['getContactById']);

        module(function($provide) {
            $provide.value('ContactService', mockContactService);
        });

        inject(function(ConsigneeService, $httpBackend, EumsConfig, $q) {
            var deferred = $q.defer();
            deferred.resolve(fullContactResponse);
            mockContactService.getContactById.and.returnValue(deferred.promise);

            mockBackend = $httpBackend;
            consigneeEndpointUrl = EumsConfig.BACKEND_URLS.CONSIGNEE;
            consigneeService = ConsigneeService;
        });
    });

    it('should get consignee with full contact person details', function(done) {
        mockBackend.whenGET(consigneeEndpointUrl + consigneeId + '/').respond(stubConsignee);
        consigneeService.getConsigneeDetails(consigneeId).then(function(returnedConsignee) {
            expect(returnedConsignee).toEqual(expectedConsignee);
            done();
        });
        mockBackend.flush();
    });
});

