describe('Consignees Controller', function () {
    var mockConsigneeService,  scope, deferredConsignees;
    var consignees = [{name: 'Dwelling Places'}, {name: 'Save the children'}, {name: 'Amuru DHO'}];

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['all']);

        inject(function ($controller, $rootScope, $q) {
            deferredConsignees = $q.defer();
            mockConsigneeService.all.and.returnValue(deferredConsignees.promise);
            scope = $rootScope.$new();
            $controller('ConsigneesController', {
                $scope: scope,
                ConsigneeService: mockConsigneeService
            });
        });
    });

    it('should fetch consignees and put them on the scope.', function () {
        deferredConsignees.resolve(consignees);
        scope.$apply();
        expect(mockConsigneeService.all).toHaveBeenCalled();
        expect(scope.consignees).toEqual(consignees);
    });

    it('should fire off an event to edit consignee when edit button is clicked', function() {
        var consignee = {};
        var broadcast = spyOn(scope, '$broadcast');
        scope.edit(consignee);
        expect(broadcast).toHaveBeenCalledWith('edit-consignee', consignee);
    });
});