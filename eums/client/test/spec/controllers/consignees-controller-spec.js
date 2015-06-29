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
});