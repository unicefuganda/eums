describe('Consignees Controller', function () {
    var mockConsigneeService, scope, deferredConsignees, mockConsigneeModel, saveConsigneePromise,
        updateConsigneePromise, deleteConsigneePromise, toast, deferredSearchResults;


    var savedConsignee = {
        id: 1, name: 'Dwelling Places', switchToReadMode: function () {
        }, switchToEditMode: function () {
        }
    };
    var emptyConsignee = {
        properties: null, switchToEditMode: function () {
        }
    };
    var consignees = [{name: 'Dwelling Places'}, {name: 'Save the children'}, {name: 'Amuru DHO'}];
    var consigneesResponse = {results: consignees, count: consignees.length, next: 'next-page', previous: 'prev-page'};
    var searchResults = consignees.first(2);

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['all', 'create', 'update', 'del', 'search']);
        mockConsigneeModel = function () {
            this.properties = emptyConsignee.properties;
        };

        inject(function ($controller, $rootScope, $q, ngToast) {
            deferredConsignees = $q.defer();
            deferredSearchResults = $q.defer();
            saveConsigneePromise = $q.defer();
            updateConsigneePromise = $q.defer();
            deleteConsigneePromise = $q.defer();

            deferredConsignees.resolve(consigneesResponse);
            saveConsigneePromise.resolve(savedConsignee);
            updateConsigneePromise.resolve(savedConsignee);
            deferredSearchResults.resolve({results: searchResults});

            mockConsigneeService.all.and.returnValue(deferredConsignees.promise);
            mockConsigneeService.create.and.returnValue(saveConsigneePromise.promise);
            mockConsigneeService.update.and.returnValue(updateConsigneePromise.promise);
            mockConsigneeService.del.and.returnValue(deleteConsigneePromise.promise);
            mockConsigneeService.search.and.returnValue(deferredSearchResults.promise);

            toast = ngToast;
            scope = $rootScope.$new();

            $controller('ConsigneesController', {
                $scope: scope,
                ConsigneeService: mockConsigneeService,
                Consignee: mockConsigneeModel
            });
        });
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

    it('should switch consignee to edit mode when edit is called', function () {
        scope.$apply();
        spyOn(emptyConsignee, 'switchToEditMode');
        scope.edit(emptyConsignee);
        expect(emptyConsignee.switchToEditMode).toHaveBeenCalled();
    });

    it('should broadcast deleteConsignee event when showDeleteDialog is called', function () {
        var consignee = {id: 1};
        scope.$apply();
        spyOn(scope, '$broadcast');
        scope.showDeleteDialog(consignee);
        scope.$apply();
        expect(scope.$broadcast).toHaveBeenCalledWith('deleteConsignee', consignee);
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
            expect(toast.create).toHaveBeenCalledWith({
                content: 'Consignee deleted successfully', class: 'success', maxNumber: 1, dismissOnTimeout: true
            });
        });
    });

    it('should search for consignees with scope search term', function () {
        scope.$apply();
        expect(scope.consignees).toEqual(consignees);

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

    it('should maintain search term when moving through pages', function() {
        var term = 'search term';
        scope.searchTerm = term;
        scope.$apply();
        scope.goToPage(10);
        scope.$apply();
        expect(mockConsigneeService.all).toHaveBeenCalledWith([], {paginate: 'true', page: 10, search: term});
    });
});