describe('Ip item deliveries', function () {
    var scope, mockDeliveryNodeService, mockItemService, deferredSearchResults, mockConsigneeItemService,
        mockLoaderService;
    var node = {
        'id': 34,
        'distribution_plan': 33,
        'location': 'Kampala',
        'consignee': 39,
        'tree_position': 'END_USER',
        'parents': '',
        'quantity_in': 5,
        'contact_person_id': '14',
        'item': 30,
        'delivery_date': '2014-09-25',
        'remark': 'In good condition',
        'track': 'False',
        'quantity_out': 0,
        'balance': 5,
        'has_children': 'False'
    };
    var paginatedNodesResponse = {results: [node]};
    var fetchedItem = {id: 1, description: 'Some name', unit: 1};
    var searchResults = [node];
    var allNodes = paginatedNodesResponse.results;
    var fetched_consignee_items = {results: [{id: 2, availableBalance: 450}]};

    beforeEach(function () {
        module('IpItemDeliveries');

        mockDeliveryNodeService = jasmine.createSpyObj('DeliveryNodeService', ['filter', 'search']);
        mockItemService = jasmine.createSpyObj('ItemService', ['get']);
        mockConsigneeItemService = jasmine.createSpyObj('ConsigneeItemService', ['filter']);
        mockLoaderService = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);

        inject(function ($controller, $rootScope, $q) {
            scope = $rootScope.$new();
            var routeParams = {itemId: 2};
            deferredSearchResults = $q.defer();

            mockDeliveryNodeService.filter.and.returnValue($q.when(paginatedNodesResponse));
            mockDeliveryNodeService.search.and.returnValue(deferredSearchResults.promise);
            mockItemService.get.and.returnValue($q.when(fetchedItem));
            mockConsigneeItemService.filter.and.returnValue($q.when(fetched_consignee_items));

            $controller('IpItemDeliveriesController', {
                $scope: scope,
                DeliveryNodeService: mockDeliveryNodeService,
                $routeParams: routeParams,
                ItemService: mockItemService,
                ConsigneeItemService: mockConsigneeItemService,
                LoaderService: mockLoaderService
            });
        });
    });

    it('should by default not show new delivery screen', function() {
        scope.$apply();
        expect(scope.newDeliveryFormShowing).toBeFalsy();
    });

    it('should load deliveries on the scope', function () {
        scope.$apply();
        expect(scope.deliveryNodes.length).toBe(1);
        expect(scope.deliveryNodes).toContain(node);
    });

    it('should fetch item details and put them on scope', function () {
        scope.$apply();
        expect(scope.item).toEqual(fetchedItem);
    });

    it('should fetch new page when goToPage is called and put the nodes on that page on scope', function () {
        scope.goToPage(10);
        scope.$apply();
        expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith({
                page: 10,
                consignee_deliveries_for_item: jasmine.any(Number),
                paginate: true
            },
            ['contact_person_id']
        );
        expect(scope.deliveryNodes).toEqual(allNodes);
    });

    it('should search for nodes with scope search term', function () {
        scope.$apply();
        expect(scope.deliveryNodes).toEqual(allNodes);
        deferredSearchResults.resolve({results: searchResults});

        var searchTerm = 'some consignee name';
        scope.searchTerm = searchTerm;
        scope.$apply();
        expect(mockDeliveryNodeService.search).toHaveBeenCalledWith(
            searchTerm,
            ['contact_person_id'],
            {consignee_deliveries_for_item: 2, paginate: true}
        );
        expect(scope.deliveryNodes).toEqual(searchResults);

        scope.searchTerm = '';
        scope.$apply();
        expect(mockDeliveryNodeService.filter).toHaveBeenCalled();
        expect(scope.deliveryNodes).toEqual(allNodes);
    });

    it('should maintain search term when moving through pages', function () {
        var term = 'search term';
        scope.searchTerm = term;
        scope.$apply();
        scope.goToPage(10);
        scope.$apply();
        expect(mockDeliveryNodeService.filter).toHaveBeenCalledWith(
            {
                page: 10, search: term,
                consignee_deliveries_for_item: jasmine.any(Number),
                paginate: true
            },
            ['contact_person_id']
        );
    });

    it('should toggle search mode during search', function () {
        scope.$apply();
        expect(scope.searching).toBe(false);
        scope.searchTerm = 'something';
        scope.$apply();
        expect(mockDeliveryNodeService.search).toHaveBeenCalled();
        expect(scope.searching).toBe(true);
        deferredSearchResults.resolve({results: searchResults});
        scope.$apply();
        expect(scope.searching).toBe(false);
    });

    it('should fetch consignee item details on load', function () {
        scope.$apply();
        expect(mockConsigneeItemService.filter).toHaveBeenCalledWith({item: 2});
        expect(scope.quantityAvailable).toBe(450);
    });

    it('should show loader while loading the paging at the start', function () {
        scope.$apply();
        expect(mockLoaderService.showLoader).toHaveBeenCalled();
        expect(mockLoaderService.hideLoader).toHaveBeenCalled();
    });

    it('should toggle new delivery form visibility', function() {
        scope.$apply();
        scope.toggleNewDeliveryForm();
        expect(scope.newDeliveryFormShowing).toBeTruthy();
        scope.toggleNewDeliveryForm();
        expect(scope.newDeliveryFormShowing).toBeFalsy();
    });

    it('should reload its data', function() {
        scope.$apply();
        mockItemService.get.calls.reset();
        mockConsigneeItemService.filter.calls.reset();
        mockDeliveryNodeService.filter.calls.reset();

        scope.reloadParentController();

        expect(mockItemService.get).toHaveBeenCalled();
        expect(mockConsigneeItemService.filter).toHaveBeenCalled();
        expect(mockDeliveryNodeService.filter).toHaveBeenCalled();
    });

    it('should hide new delivery form on reload', function() {
        scope.$apply();
        scope.newDeliveryFormShowing = true;
        scope.reloadParentController();
        expect(scope.newDeliveryFormShowing).toBeFalsy();
    });
});