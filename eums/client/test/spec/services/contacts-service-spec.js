describe('Contacts Service', function () {
    var mockHttpService, contactService;
    var stubContact = {
        firstname: 'Tunji',
        lastname: 'Sunmonu',
        phone: '+234778945674'

    };
    beforeEach(function () {
        module('contacts');

        mockHttpService = jasmine.createSpyObj('mockHttpService', ['post']);

        module(function ($provide) {
            $provide.value('$http', mockHttpService);
        });

        inject(function (ContactService, $q) {
            var defer = $q.defer();
            defer.resolve(stubContact);
            mockHttpService.post.and.returnValue(defer.promise);
            contactService = ContactService;

        });
    });

    it('should add contact to', function () {
        contactService.addContact(stubContact).then(function (response) {
            expect(response).toEqual(stubContact);
        });
    });
});