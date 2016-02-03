describe('Consignees Controller', function () {
    var mockConsigneeService, mockUserService;
    var scope, mockConsigneeModel, deferredCanFullyEdit, timeout, toast, deferredSearchResults, elementSpy,
        userHasPermissionToPromise, deferredPermissionsResults;

    var emptyFunction = function () {
    };
    var fakeElement = {modal: emptyFunction, hasClass: emptyFunction};
    var savedConsignee = {
        id: 1, name: 'Dwelling Places', switchToReadMode: emptyFunction, switchToEditMode: emptyFunction
    };
    var emptyConsignee = {
        properties: null,
        switchToEditMode: emptyFunction,
        switchToEditRemarkMode: emptyFunction,
        switchToReadMode: emptyFunction
    };
    var consignees = [savedConsignee, {id: 2, name: 'Save the children'}, {id: 3, name: 'Amuru DHO'}];
    var consigneesResponse = {
        results: consignees,
        count: consignees.length,
        next: 'next-page',
        previous: 'prev-page',
        pageSize: 1
    };
    var searchResults = consignees.first(3);

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['all', 'create', 'update', 'del', 'userCanFullyEdit']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['hasPermission', 'retrieveUserPermissions']);
        mockConsigneeModel = function () {
            this.properties = emptyConsignee.properties;
        };

        inject(function ($controller, $rootScope, $q, $timeout, ngToast) {
            timeout = $timeout;
            deferredSearchResults = $q.defer();
            deferredCanFullyEdit = $q.defer();
            mockConsigneeService.all.and.returnValue($q.when(consigneesResponse));
            mockConsigneeService.create.and.returnValue($q.when(savedConsignee));
            mockConsigneeService.update.and.returnValue($q.when(savedConsignee));
            mockConsigneeService.del.and.returnValue($q.defer());
            mockConsigneeService.userCanFullyEdit.and.returnValue(deferredCanFullyEdit.promise);

            deferredPermissionsResults = $q.defer();
            userHasPermissionToPromise = $q.defer();
            mockUserService.hasPermission.and.returnValue(userHasPermissionToPromise.promise);
            mockUserService.retrieveUserPermissions.and.returnValue(deferredPermissionsResults.promise);

            toast = ngToast;
            scope = $rootScope.$new();

            elementSpy = spyOn(angular, 'element').and.returnValue(fakeElement);

            $controller('ConsigneesController', {
                $scope: scope,
                ConsigneeService: mockConsigneeService,
                Consignee: mockConsigneeModel,
                UserService: mockUserService
            });
        });
    });

    afterEach(function () {
        elementSpy.and.callThrough();
    });

    describe('loaded', function () {
        beforeEach(function () {
            userHasPermissionToPromise.resolve(true);
        });

        it('should fetch consignees and put them on the scope.', function () {
            scope.$apply();
            expect(mockConsigneeService.all.calls.mostRecent().args).toEqual([undefined, {paginate: 'true', page: 1}]);
            expect(scope.consignees).toEqual(consignees);
            expect(scope.originalConsignees).toEqual(consignees);
        });

        it('should fetch consignees and put their count on scope', function () {
            scope.$apply();
            expect(mockConsigneeService.all.calls.mostRecent().args).toEqual([undefined, {paginate: 'true', page: 1}]);
            expect(scope.count).toEqual(consignees.length);
            expect(scope.pageSize).toEqual(1);
        });

        it('should add empty consignee at the top of the list when add method is called', function () {
            var initialNumberOfConsignees = consignees.length + 1;
            scope.$apply();
            scope.addConsignee();
            expect(JSON.stringify(scope.consignees.first())).toEqual(JSON.stringify(emptyConsignee));
            expect(scope.consignees.length).toBe(initialNumberOfConsignees);
        });

        it('should save consignee and update their id on scope', function () {
            scope.$apply();
            scope.save(scope.consignees.first());
            scope.$apply();
            expect(scope.consignees.first().id).toBe(savedConsignee.id);
        });

        it('should update consignee when save is called with consignee that already has an id', function () {
            scope.$apply();
            scope.save(savedConsignee);
            expect(mockConsigneeService.update).toHaveBeenCalledWith(savedConsignee);
        });

        it('should switch consignee back to read mode after an update', function () {
            spyOn(savedConsignee, 'switchToReadMode');
            scope.save(savedConsignee);
            scope.$apply();
            expect(savedConsignee.switchToReadMode).toHaveBeenCalled();
        });

        it('should switch consignee to edit mode on edit when user has permission to fully edit', function () {
            deferredCanFullyEdit.resolve({permission: 'can_edit_fully'});
            spyOn(emptyConsignee, 'switchToEditMode');
            scope.edit(emptyConsignee);
            scope.$apply();
            expect(emptyConsignee.switchToEditMode).toHaveBeenCalled();
        });

        it('should switch consignee to edit-remark-mode on edit when user does has permission to edit partially', function () {
            deferredCanFullyEdit.resolve({permission: 'can_edit_partially'});
            spyOn(emptyConsignee, 'switchToEditRemarkMode');
            scope.edit(emptyConsignee);
            scope.$apply();
            expect(emptyConsignee.switchToEditRemarkMode).toHaveBeenCalled();
        });

        it('should switch consignee to read mode on edit when user does not have permission to edit', function () {
            deferredCanFullyEdit.resolve({permission: 'consignee_forbidden'});
            spyOn(emptyConsignee, 'switchToReadMode');
            scope.edit(emptyConsignee);
            scope.$apply();
            expect(emptyConsignee.switchToReadMode).toHaveBeenCalled();
        });

        it('should broadcast deleteConsignee event when showDeleteDialog is called', function () {
            var consignee = {id: 1};
            scope.$apply();
            spyOn(scope, '$broadcast');
            scope.showDeleteDialog(consignee);
            scope.$apply();
            expect(scope.$broadcast).toHaveBeenCalledWith('deleteConsignee', consignee);
        });

        it('should cancel edit of consignee by switching them to read mode if they have an id', function () {
            deferredCanFullyEdit.resolve({permission: 'can_edit_fully'});
            spyOn(savedConsignee, 'switchToReadMode');
            scope.$apply();
            savedConsignee.switchToEditMode();
            scope.cancelEditOrCreate(savedConsignee);
            scope.$apply();
            expect(savedConsignee.switchToReadMode).toHaveBeenCalled();
        });

        it('should cancel edit of consignee by removing them from scope if they do not have an id', function () {
            scope.$apply();
            var consignee = scope.consignees.first();
            consignee.id = undefined;
            scope.cancelEditOrCreate(consignee);
            scope.$apply();
            expect(scope.consignees).not.toContain(consignee);
        });
    });

    describe('permissions', function () {
        it('should set the list of permissions on the scope when controller executes', function () {
            deferredPermissionsResults.resolve(['permission_one', 'permission_two']);
            scope.$apply();
            expect(scope.userPermissions).toEqual(['permission_one', 'permission_two']);
        });
    });

    describe('when consigneeDeleted event is received', function () {
        var childScope, firstConsignee, removeSpy;

        beforeEach(function () {
            childScope = scope.$new();
            firstConsignee = scope.consignees.first();
        });

        it('should remove deleted consignee from list of consignees', function () {
            removeSpy = spyOn(scope.consignees, 'remove').and.callThrough();
            childScope.$emit('consigneeDeleted', firstConsignee);
            scope.$apply();
            expect(removeSpy).toHaveBeenCalledWith(jasmine.any(Function));
            expect(scope.consignees).not.toContain(firstConsignee);
        });

        it('should notify user of successful delete', function () {
            spyOn(toast, 'create');
            childScope.$emit('consigneeDeleted', firstConsignee);
            scope.$apply();
            expect(toast.create).toHaveBeenCalledWith({content: 'Consignee deleted successfully', class: 'success'});
        });
    });

    describe('when searching', function () {
        it('should search for consignees with scope search term', function () {
            scope.$apply();
            expect(scope.consignees).toEqual(consignees);

            deferredSearchResults.resolve({results: searchResults});
            var searchText = 'some consignee name';
            scope.searchTerm.search = searchText;
            scope.$apply();
            timeout.flush();

            expect(mockConsigneeService.all).toHaveBeenCalledWith(undefined, {paginate: 'true', page: 1, search : searchText});
            expect(scope.consignees).toEqual(searchResults);

            scope.searchTerm.search = '';
            scope.$apply();
            expect(mockConsigneeService.all).toHaveBeenCalled();
            expect(scope.consignees).toEqual(consignees);
        });

        it('should fetch new page when pageChanged is called and put the consignees on that page on scope', function () {
            scope.goToPage(10);
            scope.$apply();
            expect(mockConsigneeService.all).toHaveBeenCalledWith(undefined, {paginate: 'true', page: 10});
            expect(scope.consignees).toEqual(consignees);
        });

        it('should maintain search term when moving through pages', function () {
            var searchText = 'search term';
            scope.searchTerm.search = searchText;
            scope.$apply();
            scope.goToPage(10);
            scope.$apply();
            expect(mockConsigneeService.all).toHaveBeenCalledWith(undefined, {paginate: 'true', page: 10, search: searchText});
        });

        it('should toggle search mode during search', function () {
            scope.$apply();
            expect(scope.searching).toBe(false);

            scope.searchTerm.search = 'something';
            scope.$apply();
            timeout.flush();
            expect(mockConsigneeService.all).toHaveBeenCalled();
            expect(scope.searching).toBe(true);
        });
    });
});