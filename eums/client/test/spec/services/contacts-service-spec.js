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
        module('contacts');

        inject(function(ContactService, $httpBackend, EumsConfig) {
            mockContactsBackend = $httpBackend;
            contactService = ContactService;
            config = EumsConfig;
        });
    });

    it('should add contact to', function(done) {
        mockContactsBackend.whenPOST(config.CONTACT_SERVICE_URL, stubContact).respond(expectedContact);
        contactService.addContact(stubContact).then(function(response) {
            expect(response.data).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should get contact from contacts backend', function(done) {
        done();
    });
});