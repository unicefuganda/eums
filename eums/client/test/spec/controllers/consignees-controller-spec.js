describe('Consignees Controller', function () {
    var mockConsigneeService, mockUserService, scope, mockConsigneeModel, deferredCanFullyEdit,
        toast, deferredSearchResults, deferredPermissionsResults, elementSpy;
    var emptyFunction = function () {
    };
    var fakeElement = {modal: emptyFunction, hasClass: emptyFunction};
    var savedConsignee = {
        id: 1, name: 'Dwelling Places', switchToReadMode: emptyFunction, switchToEditMode: emptyFunction
    };
    var emptyConsignee = {properties: null, switchToEditMode: emptyFunction, switchToEditRemarkMode: emptyFunction};
    var consignees = [{name: 'Dwelling Places'}, {name: 'Save the children'}, {name: 'Amuru DHO'}];
    var consigneesResponse = {results: consignees, count: consignees.length, next: 'next-page', previous: 'prev-page', pageSize: 1};
    var searchResults = consignees.first(2);

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['all', 'create', 'update', 'del', 'search', 'userCanFullyEdit']);
        mockUserService = jasmine.createSpyObj('mockUserService', ['retrieveUserPermissions']);
        mockConsigneeModel = function () {
            this.properties = emptyConsignee.properties;
        };

        inject(function ($controller, $rootScope, $q, ngToast) {
            mockConsigneeService.all.and.returnValue($q.when(consigneesResponse));
            mockConsigneeService.create.and.returnValue($q.when(savedConsignee));
            mockConsigneeService.update.and.returnValue($q.when(savedConsignee));
            mockConsigneeService.del.and.returnValue($q.defer());

            deferredSearchResults = $q.defer();
            deferredCanFullyEdit = $q.defer();
            mockConsigneeService.search.and.returnValue(deferredSearchResults.promise);
            mockConsigneeService.userCanFullyEdit.and.returnValue(deferredCanFullyEdit.promise);

            deferredPermissionsResults = $q.defer();
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

    it('should fetch consignees and put them on the scope.', function () {
        scope.$apply();
        expect(mockConsigneeService.all.calls.mostRecent().args).toEqual([[], {paginate: 'true'}]);
        expect(scope.consignees).toEqual(consignees);
    });

    it('should fetch consignees and put their count on scope', function () {
        scope.$apply();
        expect(mockConsigneeService.all.calls.mostRecent().args).toEqual([[], {paginate: 'true'}]);
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
        deferredCanFullyEdit.resolve(true);
        spyOn(emptyConsignee, 'switchToEditMode');
        scope.edit(emptyConsignee);
        scope.$apply()
        expect(emptyConsignee.switchToEditMode).toHaveBeenCalled();
    });

    it('should switch consignee to edit remark mode on edit when user does not have permission to fully edit', function () {
        deferredCanFullyEdit.reject(false);
        spyOn(emptyConsignee, 'switchToEditRemarkMode');
        scope.edit(emptyConsignee);
        scope.$apply()
        expect(emptyConsignee.switchToEditRemarkMode).toHaveBeenCalled();
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
        spyOn(savedConsignee, 'switchToReadMode');
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

    describe('permissions', function () {

        it('should set the list of permissions on the scope when controller executes', function () {
            deferredPermissionsResults.resolve(['permission_one', 'permission_two']);
            scope.$apply();
            expect(scope.userPermissions).toEqual(['permission_one', 'permission_two']);
        });

        it('should return back true when first permission in list exists for user', function () {
            scope.userPermissions = ['permission_one', 'permission_two'];
            expect(scope.hasPermissionTo('permission_one')).toBeTruthy();
        });

        it('should return back true when second permission in list exists for user', function () {
            scope.userPermissions = ['permission_one', 'permission_two'];
            expect(scope.hasPermissionTo('permission_two')).toBeTruthy();
        });

        it('should return back false when permissions do not exist for user', function () {
            scope.userPermissions = ['permission_one', 'permission_two'];
            expect(scope.hasPermissionTo('permission_three')).toBeFalsy();
        });

        it('should return back false when scope permissions is empty', function () {
            scope.userPermissions = [];
            expect(scope.hasPermissionTo('some_permission')).toBeFalsy();
        });

        it('should return back false when scope permissions is undefined', function () {
            scope.userPermissions = undefined;
            expect(scope.hasPermissionTo('some_permission')).toBeFalsy();
        });

        it('should return back false when permission to check is undefined', function () {
            scope.userPermissions = ['permission_one', 'permission_two'];
            expect(scope.hasPermissionTo(undefined)).toBeFalsy();
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

    it('should search for consignees with scope search term', function () {
        scope.$apply();
        expect(scope.consignees).toEqual(consignees);
        deferredSearchResults.resolve({results: searchResults});
        var searchTerm = 'some consignee name';
        scope.searchTerm = searchTerm;
        scope.$apply();
        expect(mockConsigneeService.search).toHaveBeenCalledWith(searchTerm, [], {paginate: true});
        expect(scope.consignees).toEqual(searchResults);

        scope.searchTerm = '';
        scope.$apply();
        expect(mockConsigneeService.all).toHaveBeenCalled();
        expect(scope.consignees).toEqual(consignees);
    });

    it('should fetch new page when pageChanged is called and put the consignees on that page on scope', function () {
        scope.goToPage(10);
        scope.$apply();
        expect(mockConsigneeService.all).toHaveBeenCalledWith([], {paginate: 'true', page: 10});
        expect(scope.consignees).toEqual(consignees);
    });

    it('should maintain search term when moving through pages', function () {
        var term = 'search term';
        scope.searchTerm = term;
        scope.$apply();
        scope.goToPage(10);
        scope.$apply();
        expect(mockConsigneeService.all).toHaveBeenCalledWith([], {paginate: 'true', page: 10, search: term});
    });

    it('should toggle search mode during search', function () {
        scope.$apply();
        expect(scope.searching).toBe(false);
        scope.searchTerm = 'something';
        scope.$apply();
        expect(mockConsigneeService.search).toHaveBeenCalled();
        expect(scope.searching).toBe(true);
        deferredSearchResults.resolve({results: searchResults});
        scope.$apply();
        expect(scope.searching).toBe(false);
    });
});