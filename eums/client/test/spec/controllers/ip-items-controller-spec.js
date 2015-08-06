describe('IP Items Controller', function () {
    var scope, q, mockItemService;
    var items = [{id: 1, Description: 'Plumpynut'}];
    var paginated_items_response = {results: items, count: items.length, pageSize: 2};
    beforeEach(function () {
        module('IpItems');
        inject(function($controller, $rootScope, $q){
            mockItemService = jasmine.createSpyObj('mockItemService', ['all']);

            mockItemService.all.and.returnValue($q.when(paginated_items_response));

            scope = $rootScope.$new();
            q = $q;
            $controller('IpItemsController', {
                $scope: scope,
                ItemService: mockItemService
            });
        });
    });

    it('should fetch all items ever delivered to the consignee with pagination', function() {
        scope.$apply();
        expect(mockItemService.all).toHaveBeenCalledWith([], {paginate: 'true'});
        expect(scope.items).toEqual(items);
        expect(scope.count).toEqual(1);
        expect(scope.pageSize).toEqual(2);
    });

    it('should fetch new page when goToPage is called and put the consignees on that page on scope', function () {
        scope.goToPage(10);
        scope.$apply();
        expect(mockItemService.all).toHaveBeenCalledWith([], {paginate: 'true', page: 10});
        expect(scope.items).toEqual(items);
    });
});