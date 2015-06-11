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
        mockContactsBackend.whenGET(config.CONTACT_SERVICE_URL + '?searchfield=' + searchString).respond([expectedContact]);
        contactService.search(searchString).then(function (contact) {
            expect(contact).toEqual([expectedContact]);
            done();
        });
        mockContactsBackend.flush();
    });

    it('should edit an existing contact', function (done) {
        mockContactsBackend.expectPUT(config.CONTACT_SERVICE_URL, expectedContact).respond(expectedContact);
        contactService.update(expectedContact).then(function (response) {
            expect(response).toEqual(expectedContact);
            done();
        });
        mockContactsBackend.flush();
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
            uri: config.CONTACT_SERVICE_URL,
            changeCase: false,
            idField: '_id',
            methods: jasmine.any(Object)
        });
    });
});