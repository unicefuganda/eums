describe('Contacts Service', function () {
    var mockHttpBackend, contactService, config;
    var expectedContact = {
        _id: 1,
        firstName: 'Andrew',
        lastName: 'Mukiza',
        phone: '+234778945674',
        createdByUserId: 5
    };

    beforeEach(function () {
        module('Contact');
        inject(function (ContactService, $httpBackend, EumsConfig) {
            mockHttpBackend = $httpBackend;
            contactService = ContactService;
            config = EumsConfig;
        });
    });

    it('should search for contacts by search string', function (done) {
        var searchString = expectedContact.firstName;
        mockHttpBackend.whenGET(config.BACKEND_URLS.CONTACTS + '?searchfield=' + searchString).respond([expectedContact]);
        contactService.search(searchString).then(function (contact) {
            expect(contact).toEqual([expectedContact]);
            done();
        });
        mockHttpBackend.flush();
    });

    it('should search for contacts by creator-user-id', function (done) {
        var createdByUserId = expectedContact.createdByUserId;
        mockHttpBackend.whenGET(config.BACKEND_URLS.CONTACTS + '?createdbyuserid=' + createdByUserId).respond([expectedContact]);
        contactService.findContacts(createdByUserId).then(function (contact) {
            expect(contact).toEqual([expectedContact]);
            done();
        });
        mockHttpBackend.flush();
    });

    it('should edit an existing contact', function (done) {
        mockHttpBackend.expectPUT(config.BACKEND_URLS.CONTACTS, expectedContact).respond(expectedContact);
        contactService.update(expectedContact).then(function (response) {
            expect(response).toEqual(expectedContact);
            done();
        });
        mockHttpBackend.flush();
    });

    it('should delete contact when the contact has no associated deliveries', function (done) {
        var contactPersonId = 'FDFD86B7-47D1-46FC-B722-A22F5F14F06D';
        var contactDeliveriesUrl = config.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?contact_person_id=' + contactPersonId;
        mockHttpBackend.whenGET(contactDeliveriesUrl).respond([]);
        mockHttpBackend.expectDELETE(config.BACKEND_URLS.CONTACTS + contactPersonId + '/').respond(201);
        contactService.del({_id: contactPersonId}).then(done);
        mockHttpBackend.flush();
    });

    it('should not delete contact when contact has associated deliveries', function (done) {
        var contactPersonId = 'FDFD86B7-47D1-46FC-B722-A22F5F14F06D';
        var contactDeliveriesUrl = config.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?contact_person_id=' + contactPersonId;
        mockHttpBackend.whenGET(contactDeliveriesUrl).respond([1]);
        contactService.del({_id: contactPersonId}).catch(function (reason) {
            expect(reason).toBe('Cannot delete contact that has deliveries');
            done();
        });
        mockHttpBackend.flush();
    });
});

describe('Contact Service', function () {
    var mockServiceFactory, config;

    beforeEach(function () {
        module('Contact');
        mockServiceFactory = jasmine.createSpyObj('mockServiceFactory', ['create']);

        module(function ($provide) {
            $provide.value('ServiceFactory', mockServiceFactory);
        });
        inject(function (ContactService, EumsConfig) {
            mockServiceFactory.create.and.returnValue({});
            config = EumsConfig;
        });
    });

    it('should create itself with the right parameters', function () {
        expect(mockServiceFactory.create).toHaveBeenCalledWith({
            uri: config.BACKEND_URLS.CONTACTS,
            changeCase: false,
            idField: '_id',
            methods: jasmine.any(Object)
        });
    });
});