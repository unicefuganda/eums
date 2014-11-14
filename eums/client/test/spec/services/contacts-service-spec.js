describe('Contacts Service', function () {
    var mockContactsBackend, contactService, config;
    var stubContact = {
        firstName: 'Andrew',
        lastName: 'Mukiza',
        phone: '+234778945674'
    };

    var expectedContact = {
        _id: 1,
        firstName: 'Andrew',
        lastName: 'Mukiza',
        phone: '+234778945674'
    };

    var expectedContacts = [
        {
            _id: 1,
            firstName: 'Andrew',
            lastName: 'Mukiza',
            phone: '+234778945674'
        },
        {
            _id: 2,
            firstName: 'James',
            lastName: 'Oloo',
            phone: '+234778945675'
        }
    ];

    beforeEach(function () {
        module('Contact');

        inject(function (ContactService, $httpBackend, EumsConfig) {
            mockContactsBackend = $httpBackend;
            contactService = ContactService;
            config = EumsConfig;
        });

        mockContactsBackend.whenPOST(config.CONTACT_SERVICE_URL, stubContact).respond(expectedContact);
    });

    it('should add contact to', function (done) {
        contactService.addContact(stubContact).then(function (response) {
            expect(response.data).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should get contact from contacts backend by id', function (done) {
        mockContactsBackend.whenGET(config.CONTACT_SERVICE_URL + expectedContact._id + '/').respond(expectedContact);
        contactService.getContactById(expectedContact._id).then(function (contact) {
            expect(contact).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should search for contact by search string', function (done) {
        var searchString = expectedContact.firstName;
        mockContactsBackend.whenGET(config.CONTACT_SERVICE_URL + '?searchfield=' + searchString).respond(expectedContact);
        contactService.getContactsBySearchQuery(searchString).then(function (contact) {
            expect(contact).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should load all contacts', function (done) {
        mockContactsBackend.whenGET(config.CONTACT_SERVICE_URL).respond(expectedContacts);
        contactService.getAllContacts().then(function (contacts) {
            expect(contacts).toEqual(expectedContacts);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should delete a contact', function (done) {
        mockContactsBackend.whenDELETE(config.CONTACT_SERVICE_URL + expectedContact._id + '/').respond(null);
        contactService.deleteContact(expectedContact).then(function (response) {
            expect(response).toBe(null);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should edit an existing contact', function(done) {
        mockContactsBackend.whenPUT(config.CONTACT_SERVICE_URL, expectedContact).respond(expectedContact);
        contactService.editContact(expectedContact).then(function(response) {
            expect(response).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });
});