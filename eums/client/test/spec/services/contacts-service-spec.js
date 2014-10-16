describe('Contacts Service', function() {
    var mockContactsBackend, contactService, config;
    var stubContact = {
        firstName: 'Andrew',
        lastName: 'Mukiza',
        phone: '+234778945674'
    };

    var expectedContact = {
        id: 1,
        firstName: 'Andrew',
        lastName: 'Mukiza',
        phone: '+234778945674'
    };

    beforeEach(function() {
        module('Contact');

        inject(function(ContactService, $httpBackend, EumsConfig) {
            mockContactsBackend = $httpBackend;
            contactService = ContactService;
            config = EumsConfig;
        });

        mockContactsBackend.whenPOST(config.CONTACT_SERVICE_URL, stubContact).respond(expectedContact);
    });

    it('should add contact to', function(done) {
        contactService.addContact(stubContact).then(function(response) {
            expect(response.data).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should get contact from contacts backend by id', function(done) {
        mockContactsBackend.whenGET(config.CONTACT_SERVICE_URL + expectedContact.id + '/')
            .respond(expectedContact);
        contactService.getContactById(expectedContact.id).then(function(response) {
            expect(response.data).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should search for contact by search string', function(done) {
        var searchString = expectedContact.firstName;
        mockContactsBackend.whenGET(config.CONTACT_SERVICE_URL + '?searchfield=' + searchString).respond(expectedContact);
        contactService.getContactsBySearchQuery(searchString).then(function(contact) {
            expect(contact).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });
});