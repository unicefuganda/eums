describe('ContactController', function () {
    var scope, deferred, sorter, stubContactPromise, stubContactsPromise, toastPromise, mockContactService,
        mockToastProvider, findStubContactsPromise, mockUserService, userHasPermissionToPromise, userGetCurrentUserPromise;

    var stubContact = {
        _id: 3,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+234778922674',
        createdByUserId: 5
    };

    var stubContacts = [
        {
            _id: 1,
            firstName: 'Andrew',
            lastName: 'Mukiza',
            phone: '+234778945674',
            createdByUserId: 5
        },
        {
            _id: 2,
            firstName: 'James',
            lastName: 'Oloo',
            phone: '+234778945675',
            createdByUserId: 5
        }
    ];

    var stubCurrentUser = {
        username: "admin",
        first_name: "",
        last_name: "",
        userid: 5,
        consignee_id: null,
        email: "admin@tw.org"
    };

    var mockElement = {
        modal: function () {

        }
    };

    beforeEach(module('Contact'));

    beforeEach(function () {
        module('ngTable');
        module('siTable');

        mockContactService = jasmine.createSpyObj('mockContactService', ['all', 'findContacts', 'create', 'update', 'del']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['hasPermission', 'getCurrentUser'])

        inject(function ($rootScope, $controller, $compile, $q, $sorter) {
            scope = $rootScope.$new();
            sorter = $sorter;
            stubContactsPromise = $q.defer();
            findStubContactsPromise = $q.defer();
            deferred = $q.defer();
            stubContactPromise = $q.defer();
            toastPromise = $q.defer();
            userHasPermissionToPromise = $q.defer();
            userGetCurrentUserPromise = $q.defer();
            mockContactService.all.and.returnValue(stubContactsPromise.promise);
            mockContactService.findContacts.and.returnValue(findStubContactsPromise.promise);
            mockContactService.create.and.returnValue(stubContactPromise.promise);
            mockContactService.update.and.returnValue(deferred.promise);
            mockContactService.del.and.returnValue(deferred.promise);
            mockToastProvider.create.and.returnValue(toastPromise.promise);
            mockUserService.hasPermission.and.returnValue(userHasPermissionToPromise.promise);
            mockUserService.getCurrentUser.and.returnValue(userGetCurrentUserPromise.promise);

            spyOn(angular, 'element').and.returnValue(mockElement);

            spyOn(scope, '$broadcast');
            spyOn(scope, '$on');

            $controller('ContactController', {
                $scope: scope,
                ContactService: mockContactService,
                $sorter: sorter,
                ngToast: mockToastProvider,
                UserService: mockUserService
            });
        });
    });

    describe('change sort arrow direction on sorting column in contacts', function () {
        var criteria = 'some_criteria';

        it('should return an down arrow class if a criteria is used to sort contacts)', function () {
            scope.initialize();
            scope.$apply();
            scope.sort.criteria = criteria;

            expect(scope.sortArrowClass(criteria)).toEqual('active glyphicon glyphicon-arrow-down');
        });

        it('should return an up arrow class if same criteria is used to sort contacts again)', function () {
            scope.initialize();
            scope.$apply();
            scope.sort.criteria = criteria;
            scope.sort.descending = true;

            expect(scope.sortArrowClass(criteria)).toEqual('active glyphicon glyphicon-arrow-up');
        });
    });

    it('should fetch all contacts', function () {
        userGetCurrentUserPromise.resolve(stubCurrentUser);
        userHasPermissionToPromise.resolve(true);
        stubContactsPromise.resolve(stubContacts);
        scope.initialize();
        scope.$apply();

        expect(scope.contacts).toEqual(stubContacts);
    });

    describe('showing modals', function () {
        it('should fire add-contact event to show the add contact modal', function () {
            scope.showAddContact();

            expect(scope.$broadcast).toHaveBeenCalledWith('add-contact');
        });

        it('should fire edit-contact event to show the edit contact modal', function () {
            scope.showEditContact(stubContact);
            scope.$apply();

            expect(scope.currentContact).toEqual(stubContact);
            expect(scope.$broadcast).toHaveBeenCalledWith('edit-contact', stubContact);
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
        it('should handle save-contact event', function () {
            stubContactPromise.resolve(stubContact);

            var contactScope = scope.$new();
            contactScope.$emit('contact-saved');
            scope.$apply();

            expect(scope.$on).toHaveBeenCalled();
        });

    });

    describe('editing a contact', function () {
        it('should edit a contact', function () {
            userGetCurrentUserPromise.resolve(stubCurrentUser);
            userHasPermissionToPromise.resolve(true);
            deferred.resolve();
            scope.update(stubContact);
            scope.$apply();

            expect(angular.element).toHaveBeenCalledWith('#edit-contact-modal');
            expect(mockContactService.update).toHaveBeenCalledWith(stubContact);
            expect(mockContactService.all).toHaveBeenCalled();
        });
    });

    describe('deleting a contact', function () {
        beforeEach(function () {
            spyOn(mockElement, 'modal')
        });

        it('should delete a contact and hide delete dialog', function () {
            stubContacts.push(stubContact);
            scope.contacts = stubContacts;
            scope.currentContact = stubContact;
            deferred.resolve();

            scope.deleteSelectedContact();
            scope.$apply();

            expect(angular.element).toHaveBeenCalledWith('#delete-contact-modal');
            expect(mockContactService.del).toHaveBeenCalledWith(stubContact);
            expect(mockToastProvider.create).toHaveBeenCalledWith({content: 'Contact deleted', class: 'success'});
            expect(mockElement.modal).toHaveBeenCalledWith('hide');
        });

        it('should throw a toast when contact service rejects and hide the delete dialog', function () {
            stubContacts.push(stubContact);
            scope.contacts = stubContacts;
            scope.currentContact = stubContact;
            var reason = 'cannot delete';
            deferred.reject(reason);
            scope.$apply();

            scope.deleteSelectedContact();
            scope.$apply();

            expect(mockToastProvider.create).toHaveBeenCalledWith({content: reason, class: 'danger'});
            expect(mockElement.modal).toHaveBeenCalledWith('hide');
        });
    });
});