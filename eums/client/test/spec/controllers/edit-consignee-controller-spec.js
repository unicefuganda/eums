describe('Edit Consignee Controller', function () {
    var mockConsigneeService, scope, deferredConsignee, rootScope;
    var consignee = {name: 'Dwelling Places'};

    beforeEach(function () {
        module('Consignee');
        mockConsigneeService = jasmine.createSpyObj('mockConsigneeService', ['update']);

        inject(function ($controller, $rootScope, $q) {
            deferredConsignee = $q.defer();
            mockConsigneeService.update.and.returnValue(deferredConsignee.promise);
            rootScope = $rootScope;
            scope = rootScope.$new();
            $controller('EditConsigneeController', {
                $scope: scope,
                ConsigneeService: mockConsigneeService
            });
        });
    });

    describe('when "edit-consignee" event is fired', function () {
        xit('should should show the edit consignee modal', function() {

        });

        xit('should put passed consignee on scope', function() {
            rootScope.$broadcast('edit-consignee', consignee);
            scope.$apply();
        });

        xit('should update consignee when save is called event is broadcast', function () {
            deferredConsignee.resolve(consignee);
            rootScope.$broadcast('edit-consignee', consignee);
            scope.$apply();
            expect(mockConsigneeService.update).toHaveBeenCalledWith(consignee);
        });
    });
});