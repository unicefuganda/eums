describe('Consignees Controller', function () {
    var mockConsigneeService, scope, deferredConsignees, mockConsigneeModel;
    var consignees = [{name: 'Dwelling Places'}, {name: 'Save the children'}, {name: 'Amuru DHO'}];
    var emptyConsignee = {properties: null};

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['all']);
        mockConsigneeModel = function() {
            this.properties = emptyConsignee.properties;
        };

        inject(function ($controller, $rootScope, $q) {
            deferredConsignees = $q.defer();
            deferredConsignees.resolve(consignees);
            mockConsigneeService.all.and.returnValue(deferredConsignees.promise);
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
});