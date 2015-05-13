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
    });

    it('should add contact to contacts service', function (done) {
        mockContactsBackend.expectPOST(config.CONTACT_SERVICE_URL, stubContact).respond(expectedContact);
        contactService.create(stubContact).then(function (created) {
            expect(created).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should get contact from contacts backend by id', function (done) {
        mockContactsBackend.whenGET(config.CONTACT_SERVICE_URL + expectedContact._id + '/').respond(expectedContact);
        contactService.get(expectedContact._id).then(function (contact) {
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
        contactService.all().then(function (contacts) {
            expect(contacts).toEqual(expectedContacts);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should delete a contact', function (done) {
        mockContactsBackend.whenDELETE(config.CONTACT_SERVICE_URL + expectedContact._id + '/').respond(200);
        contactService.del(expectedContact).then(function (status) {
            expect(status).toBe(200);
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