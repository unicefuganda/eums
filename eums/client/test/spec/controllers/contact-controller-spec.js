describe('ContactController', function () {
    var scope, deferred, sorter, stubContactPromise, stubContactsPromise, mockContactService, mockToastProvider;

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

        mockContactService = jasmine.createSpyObj('mockContactService',
            ['getAllContacts',
                'addContact',
                'editContact',
                'deleteContact']);

        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);

        inject(function ($rootScope, $controller, $compile, $q, $sorter) {
            scope = $rootScope.$new();
            sorter = $sorter;

            stubContactsPromise = $q.defer();
            deferred = $q.defer();
            stubContactPromise = $q.defer();
            mockContactService.getAllContacts.and.returnValue(stubContactsPromise.promise);
            mockContactService.addContact.and.returnValue(stubContactPromise.promise);
            mockContactService.editContact.and.returnValue(deferred.promise);
            mockContactService.deleteContact.and.returnValue(deferred.promise);

            spyOn(angular, 'element').and.callFake(function () {
                return {
                    modal : jasmine.createSpy('modal').and.callFake(function (status) {
                        return status;
                    })};
            });

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

    describe('showing modals', function () {
        it('should show the add contact modal', function () {
            scope.showAddContact();

            expect(angular.element).toHaveBeenCalledWith('#add-contact-modal');
        });

        it('should show the edit contact modal', function () {
            scope.showEditContact(stubContact);
            scope.$apply();

            expect(scope.currentContact).toEqual(stubContact);
            expect(angular.element).toHaveBeenCalledWith('#edit-contact-modal');
        });

        it('should show the delete contact modal', function () {
            scope.showDeleteContact(stubContact);
            scope.$apply();

            expect(scope.currentContact).toEqual(stubContact);
            expect(angular.element).toHaveBeenCalledWith('#delete-contact-modal');
        });
    });

    describe('validating a contact', function () {
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

        it('should be valid when full name and phone number are supplied', function () {
            scope.contact = {
                firstName: 'Dudette',
                lastName: 'Awesome',
                phone: '+256782555444'
            };
            scope.$apply();

            expect(scope.invalidContact(scope.contact)).toBeFalsy();
        });

    });

    describe('adding a contact', function () {
        it('should save contact', function () {
            stubContactPromise.resolve(stubContact);

            scope.contact = stubNewContact;
            scope.saveContact();
            scope.$apply();

            expect(angular.element).toHaveBeenCalledWith('#add-contact-modal');
            expect(mockContactService.addContact).toHaveBeenCalledWith(stubNewContact);
        });
    });

    describe('editing a contact', function () {
        it('should edit a contact', function () {
            deferred.resolve();
            scope.editContact(stubContact);
            scope.$apply();

            expect(angular.element).toHaveBeenCalledWith('#edit-contact-modal');
            expect(mockContactService.editContact).toHaveBeenCalledWith(stubContact);
            expect(mockContactService.getAllContacts).toHaveBeenCalled();
        });
    });

    describe('deleting a contact', function () {
        it('should delete a contact', function () {
            stubContacts.push(stubContact);
            scope.contacts = stubContacts;
            scope.currentContact = stubContact;
            deferred.resolve();

            scope.deleteSelectedContact();
            scope.$apply();

            expect(angular.element).toHaveBeenCalledWith('#delete-contact-modal');
            expect(mockContactService.deleteContact).toHaveBeenCalledWith(stubContact);
        });
    });
});