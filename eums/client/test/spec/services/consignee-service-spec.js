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
            lastName: 'Mukiza', phone: '+234778945674'
        }
    };

    var expectedConsigneeDetails = {
        id: consigneeId,
        name: 'Save the Children',
        contactPerson: fullContactResponse.data
    };

    var expectedConsignee = {
        id: consigneeId,
        name: 'Save the Children'
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

    it('should create consignee', function(done) {
        var contactId = 1;
        var stubCreatedConsignee = {id: 1, contact_person_id: contactId};
        mockBackend.whenPOST(consigneeEndpointUrl).respond(201, stubCreatedConsignee);
        consigneeService.createConsignee({contact_person_id: contactId}).then(function(createdConsignee) {
            expect(createdConsignee).toEqual(stubCreatedConsignee);
            done();
        });
        mockBackend.flush();
    });

    it('should get consignee with full contact person details', function(done) {
        mockBackend.whenGET(consigneeEndpointUrl + consigneeId + '/').respond(stubConsignee);
        consigneeService.getConsigneeDetails(consigneeId).then(function(returnedConsignee) {
            expect(returnedConsignee).toEqual(expectedConsigneeDetails);
            done();
        });
        mockBackend.flush();
    });

        it('should get consignee name', function(done) {
        mockBackend.whenGET(consigneeEndpointUrl + consigneeId + '/').respond(stubConsignee);
        consigneeService.getConsigneeById(consigneeId).then(function(returnedConsignee) {
            expect(returnedConsignee).toEqual(expectedConsignee);
            done();
        });
        mockBackend.flush();
    });

});

