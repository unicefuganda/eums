describe('Consignees Controller', function () {
    var mockConsigneeService, scope, deferredConsignees, mockConsigneeModel, saveConsigneePromise, updateConsigneePromise;
    var consignees = [{name: 'Dwelling Places'}, {name: 'Save the children'}, {name: 'Amuru DHO'}];
    var savedConsignee = {id: 1, name: 'Dwelling Places',  switchToReadMode: function() {}, switchToEditMode: function() {}};
    var emptyConsignee = {properties: null, switchToEditMode: function() {}};

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['all', 'create', 'update']);
        mockConsigneeModel = function() {
            this.properties = emptyConsignee.properties;
        };

        inject(function ($controller, $rootScope, $q) {
            deferredConsignees = $q.defer();
            saveConsigneePromise = $q.defer();
            updateConsigneePromise = $q.defer();

            deferredConsignees.resolve(consignees);
            saveConsigneePromise.resolve(savedConsignee);
            updateConsigneePromise.resolve(savedConsignee);

            mockConsigneeService.all.and.returnValue(deferredConsignees.promise);
            mockConsigneeService.create.and.returnValue(saveConsigneePromise.promise);
            mockConsigneeService.update.and.returnValue(updateConsigneePromise.promise);

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
        expect(mockConsigneeService.all).toHaveBeenCalled();
        expect(scope.consignees).toEqual(consignees);
    });

    it('should add empty consignee at the top of the list when add method is called', function () {
        var initialNumberOfConsignees = consignees.length + 1;
        scope.$apply();
        scope.addConsignee();
        expect(JSON.stringify(scope.consignees.first())).toEqual(JSON.stringify(emptyConsignee));
        expect(scope.consignees.length).toBe(initialNumberOfConsignees);
    });

    it('should save consignee and update their id on scope', function() {
        scope.$apply();
        scope.save(scope.consignees.first());
        scope.$apply();
        expect(scope.consignees.first().id).toBe(savedConsignee.id);
    });

    it('should update consignee when save is called with consignee that already has an id', function() {
        scope.$apply();
        scope.save(savedConsignee);
        expect(mockConsigneeService.update).toHaveBeenCalledWith(savedConsignee);
    });

    it('should switch consignee back to read mode after an update', function() {
        spyOn(savedConsignee, 'switchToReadMode');
        scope.save(savedConsignee);
        scope.$apply();
        expect(savedConsignee.switchToReadMode).toHaveBeenCalled();
    });

    it('should switch consignee to edit mode when edit is called', function() {
        scope.$apply();
        spyOn(emptyConsignee, 'switchToEditMode');
        scope.edit(emptyConsignee);
        expect(emptyConsignee.switchToEditMode).toHaveBeenCalled();
    });
});