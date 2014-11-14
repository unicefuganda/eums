describe('ContactController', function () {
    var scope, sorter, stubContactPromise, stubContactsPromise, mockContactService, mockToastProvider;

    var stubNewContact = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+234778922674'
    };

    var stubContact = {
        _id: 3,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+234778922674'
    };

    var stubContacts = [
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

    beforeEach(module('Contact'));

    beforeEach(function () {
        module('ngTable');
        module('siTable');

        mockContactService = jasmine.createSpyObj('mockContactService', ['getAllContacts', 'addContact']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);

        inject(function ($rootScope, $controller, $q, $sorter) {
            scope = $rootScope.$new();
            sorter = $sorter;

            stubContactsPromise = $q.defer();
            stubContactPromise = $q.defer();
            mockContactService.getAllContacts.and.returnValue(stubContactsPromise.promise);
            mockContactService.addContact.and.returnValue(stubContactPromise.promise);

            $controller('ContactController',
                {
                    $scope: scope,
                    ContactService: mockContactService,
                    $sorter: sorter,
                    $ngToast: mockToastProvider
                });
        });
    });

    it('should fetch all contacts', function () {
        stubContactsPromise.resolve(stubContacts);
        scope.initialize();
        scope.$apply();

        expect(scope.contacts).toEqual(stubContacts);
    });

    describe('adding a contact', function () {
        describe('with invalid fields', function () {
            it('should be invalid when no number is supplied', function () {
                scope.contact = {
                    firstName: 'Dude',
                    lastName: 'Awesome',
                    phone: ''
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });

            it('should be invalid when no first name is supplied', function () {
                scope.contact = {
                    firstName: '',
                    lastName: 'Awesome',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });

            it('should be invalid when no last name is supplied', function () {
                scope.contact = {
                    firstName: 'Dudette',
                    lastName: '',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeTruthy();
            });
        });

        describe('with valid fields', function () {
            it('should be valid when full name and phone number are supplied', function () {
                scope.contact = {
                    firstName: 'Dudette',
                    lastName: 'Awesome',
                    phone: '+256782555444'
                };
                scope.$apply();

                expect(scope.invalidContact(scope.contact)).toBeFalsy();
            });

            xit('should save contact', function () {
                stubContactPromise.resolve(stubContact);

                scope.contact = stubNewContact;
                scope.saveContact();
                scope.$apply();

                expect(mockContactService.addContact).toHaveBeenCalledWith(stubNewContact);
            });
        });
    });
});