describe('Contacts Service', function () {
    var mockContactsBackend, contactService;
    var stubContact = {
        firstname: 'Tunji',
        lastname: 'Sunmonu',
        phone: '+234778945674'

    };

    beforeEach(function () {
        module('contacts');

        inject(function (ContactService, $httpBackend, EumsConfig) {
            mockContactsBackend = $httpBackend;
            mockContactsBackend.whenPOST(EumsConfig.CONTACT_SERVICE_URL + 'add').respond(stubContact);
            contactService = ContactService;
        });
    });

    it('should add contact to', function (done) {
        contactService.addContact(stubContact).then(function (response) {
            expect(response.data).toEqual(stubContact);
            done();
        });
        mockContactsBackend.flush();
    });
});