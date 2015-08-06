describe('IP Items Controller', function () {
    var scope, q, mockItemService;
    var items = [{id: 1, Description: 'Plumpynut'}];
    beforeEach(function () {
        module('IpItems');
        inject(function($controller, $rootScope, $q){
            mockItemService = jasmine.createSpyObj('mockItemService', ['all']);

            mockItemService.all.and.returnValue($q.when(items));

            scope = $rootScope.$new();
            q = $q;
            $controller('IpItemsController', {
                $scope: scope,
                ItemService: mockItemService
            });
        });
    });

    it('should fetch all items ever delivered to the consignee', function() {
        scope.$apply();
        expect(mockItemService.all).toHaveBeenCalled();
        expect(scope.items).toEqual(items);
    });
});