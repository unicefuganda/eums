describe('ContactController', function () {
    var scope, deferred, sorter, stubContactPromise, stubContactsPromise, toastPromise, mockContactService,
        mockLoaderService, mockConsigneeService, mockUserService, mockSystemSettingsService;
    var userGetUserByIdPromise, mockToastProvider, findStubContactsPromise, userHasPermissionToPromise,
        userGetCurrentUserPromise, deferredPermissionsResultsPromise, consigneePromise;
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
            createdByUserId: 1,
            ips: [8]
        },
        {
            _id: 2,
            firstName: 'James',
            lastName: 'Oloo',
            phone: '+234778945675',
            createdByUserId: 5,
            ips: [1]
        },
        {
            _id: 3,
            firstName: 'John',
            lastName: 'Doe',
            phone: '+234778945676',
            ips: []
        }
    ];
    var adminPermissions = [
        "auth.can_view_self_contacts",
        "auth.can_view_contacts",
        "auth.can_create_contacts",
        "auth.can_edit_contacts",
        "auth.can_delete_contacts"
    ];
    var stubCurrentUser = {
        username: "admin",
        first_name: "",
        last_name: "",
        userid: 5,
        consignee_id: null,
        email: "admin@tw.org"
    };
    var user = {id: 1, username: 'admin', groups: ['UNICEF_admin']};
    var consignee = {id: 8, name: 'WAKISO DHO'};
    var mockElement = {
        modal: function () {

        }
    };
    var stubSettings = {
        'notification_message': 'notification',
        'district_label': 'district'
    };

    beforeEach(module('Contact'));

    beforeEach(function () {
        module('ngTable');
        module('siTable');

        mockContactService = jasmine.createSpyObj('mockContactService', ['all', 'findContacts', 'create', 'update', 'del']);
        mockToastProvider = jasmine.createSpyObj('mockToastProvider', ['create']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['hasPermission', 'getCurrentUser', 'getUserById', 'retrieveUserPermissions'])
        mockSystemSettingsService = jasmine.createSpyObj('mockSystemSettingsService', ['getSettings', 'getSettingsWithDefault']);
        mockLoaderService = jasmine.createSpyObj('mockLoaderService', ['showLoader', 'hideLoader', 'showModal']);
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['get']);

        inject(function ($rootScope, $controller, $compile, $q, $sorter) {
            scope = $rootScope.$new();
            sorter = $sorter;
            stubContactsPromise = $q.defer();
            findStubContactsPromise = $q.defer();
            deferred = $q.defer();
            stubContactPromise = $q.defer();
            toastPromise = $q.defer();
            deferredPermissionsResultsPromise = $q.defer();
            userHasPermissionToPromise = $q.defer();
            userGetCurrentUserPromise = $q.defer();
            userGetUserByIdPromise = $q.defer();
            consigneePromise = $q.defer();
            mockContactService.all.and.returnValue(stubContactsPromise.promise);
            mockContactService.findContacts.and.returnValue(findStubContactsPromise.promise);
            mockContactService.create.and.returnValue(stubContactPromise.promise);
            mockContactService.update.and.returnValue(deferred.promise);
            mockContactService.del.and.returnValue(deferred.promise);
            mockToastProvider.create.and.returnValue(toastPromise.promise);
            mockUserService.hasPermission.and.returnValue(userHasPermissionToPromise.promise);
            mockUserService.getCurrentUser.and.returnValue(userGetCurrentUserPromise.promise);
            mockUserService.getUserById.and.returnValue(userGetUserByIdPromise.promise);
            mockUserService.retrieveUserPermissions.and.returnValue(deferredPermissionsResultsPromise.promise);
            mockSystemSettingsService.getSettings.and.returnValue($q.when(stubSettings));
            mockSystemSettingsService.getSettingsWithDefault.and.returnValue($q.when(stubSettings));
            mockConsigneeService.get.and.returnValue(consigneePromise.promise);

            spyOn(angular, 'element').and.returnValue(mockElement);
            spyOn(scope, '$broadcast');
            spyOn(scope, '$on');

            $controller('ContactController', {
                $scope: scope,
                $sorter: sorter,
                ContactService: mockContactService,
                ngToast: mockToastProvider,
                UserService: mockUserService,
                SystemSettingsService: mockSystemSettingsService,
                LoaderService: mockLoaderService,
                ConsigneeService: mockConsigneeService
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
        deferredPermissionsResultsPromise.resolve(adminPermissions);
        userGetCurrentUserPromise.resolve(stubCurrentUser);
        userHasPermissionToPromise.resolve(true);
        stubContactsPromise.resolve(stubContacts);
        userGetUserByIdPromise.resolve(user);
        consigneePromise.resolve(consignee);

        scope.initialize();
        scope.$apply();

        expect(scope.contacts).toEqual(stubContacts);
        expect(scope.contacts[0].createdByUserName).toEqual('UNICEF');
        expect(scope.contacts[0].ipNames).toEqual(['WAKISO DHO']);
        expect(scope.contacts[1].createdByUserName).toEqual('UNICEF');
        expect(scope.contacts[1].ipNames).toEqual(['WAKISO DHO']);
        expect(scope.contacts[2].createdByUserName).toEqual('');
        expect(scope.contacts[2].ipNames).toEqual([]);

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
                phone: '+256782555444',
                district: 'wakiso',
                ips: [1, 2]
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
            deferredPermissionsResultsPromise.resolve(adminPermissions);
            userGetCurrentUserPromise.resolve(stubCurrentUser);
            userHasPermissionToPromise.resolve(true);
            deferred.resolve();

            scope.initialize();
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
