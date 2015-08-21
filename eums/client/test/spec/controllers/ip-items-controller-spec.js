describe('IP Items Controller', function () {
    var scope, q, mockConsigneeItemService, deferredSearchResults, location;
    var items = [{id: 1, Description: 'Plumpynut'}, {id: 1, Description: 'Books'}, {id: 1, Description: 'Shoes'}];
    var paginatedItemsResponse = {results: items, count: items.length, pageSize: 2};
    var searchResults = items.first(2);

    beforeEach(function () {
        module('IpItems');
        inject(function ($controller, $rootScope, $q, $location) {
            mockConsigneeItemService = jasmine.createSpyObj('mockConsigneeItemService', ['all', 'search']);
            deferredSearchResults = $q.defer();
            mockConsigneeItemService.all.and.returnValue($q.when(paginatedItemsResponse));
            mockConsigneeItemService.search.and.returnValue(deferredSearchResults.promise);
            location = $location;
            spyOn($location,'path').and.returnValue('fake location');

            scope = $rootScope.$new();
            q = $q;
            $controller('IpItemsController', {
                $scope: scope,
                ConsigneeItemService: mockConsigneeItemService
            });
        });
    });

    it('should fetch all items ever delivered to the consignee', function () {
        scope.$apply();
        expect(mockConsigneeItemService.all).toHaveBeenCalled();
        expect(scope.items).toEqual(items);
        expect(scope.count).toEqual(3);
        expect(scope.pageSize).toEqual(2);
    });

    it('should fetch new page when goToPage is called and put the consignees on that page on scope', function () {
        scope.goToPage(10);
        scope.$apply();
        expect(mockConsigneeItemService.all).toHaveBeenCalledWith([], {page: 10});
        expect(scope.items).toEqual(items);
    });

    it('should search for items with scope search term', function () {
        scope.$apply();
        expect(scope.items).toEqual(items);
        deferredSearchResults.resolve({results: searchResults});
        var searchTerm = 'some item name';
        scope.searchTerm = searchTerm;
        scope.$apply();
        expect(mockConsigneeItemService.search).toHaveBeenCalledWith(searchTerm);
        expect(scope.items).toEqual(searchResults);

        scope.searchTerm = '';
        scope.$apply();
        expect(mockConsigneeItemService.all).toHaveBeenCalled();
        expect(scope.items).toEqual(items);
    });

    it('should maintain search term when moving through pages', function () {
        var term = 'search term';
        scope.searchTerm = term;
        scope.$apply();
        scope.goToPage(10);
        scope.$apply();
        expect(mockConsigneeItemService.all).toHaveBeenCalledWith([], {page: 10, search: term});
    });

    it('should toggle search mode during search', function () {
        scope.$apply();
        expect(scope.searching).toBe(false);
        scope.searchTerm = 'something';
        scope.$apply();
        expect(mockConsigneeItemService.search).toHaveBeenCalled();
        expect(scope.searching).toBe(true);
        deferredSearchResults.resolve({results: searchResults});
        scope.$apply();
        expect(scope.searching).toBe(false);
    });

    it('should change location to deliveries for item when passed consignee item', function(){
        var itemId = 10;
        var consigneeItem = {id: 1, item: itemId};
        scope.view(consigneeItem);
        expect(location.path).toHaveBeenCalledWith('/item-deliveries/'+ itemId);
    });
});