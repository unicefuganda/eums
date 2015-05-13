describe('Contacts Service', function () {
    var mockContactsBackend, contactService, config;
    var expectedContact = {
        _id: 1,
        firstName: 'Andrew',
        lastName: 'Mukiza',
        phone: '+234778945674'
    };

    beforeEach(function () {
        module('Contact');

        inject(function (ContactService, $httpBackend, EumsConfig) {
            mockContactsBackend = $httpBackend;
            contactService = ContactService;
            config = EumsConfig;
        });
    });

    it('should search for contact by search string', function (done) {
        var searchString = expectedContact.firstName;
        mockContactsBackend.whenGET(config.CONTACT_SERVICE_URL + '?searchfield=' + searchString).respond(expectedContact);
        contactService.filter(searchString).then(function (contact) {
            expect(contact).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should edit an existing contact', function(done) {
        mockContactsBackend.expectPUT(config.CONTACT_SERVICE_URL, expectedContact).respond(expectedContact);
        contactService.update(expectedContact).then(function(response) {
            expect(response).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });
});