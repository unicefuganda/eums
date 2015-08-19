describe('Ip item deliveries', function () {
    var scope, mockDeliveryNodeService, mockItemService;
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
    var nodes = {results: [node]};
    var fetchedItem = {id: 1, description: 'Some name', unit: 1};

    beforeEach(function () {
        module('IpItemDeliveries');

        mockDeliveryNodeService = jasmine.createSpyObj('DeliveryNodeService', ['filter']);
        mockItemService = jasmine.createSpyObj('ItemService', ['get']);

        inject(function ($controller, $rootScope, $q) {
            scope = $rootScope.$new();
            var routeParams = {itemId: 2};

            mockDeliveryNodeService.filter.and.returnValue($q.when(nodes));
            mockItemService.get.and.returnValue($q.when(fetchedItem));

            $controller('IpItemDeliveriesController', {
                $scope: scope,
                DeliveryNodeService: mockDeliveryNodeService,
                $routeParams: routeParams,
                ItemService: mockItemService
            });
        });
    });

    it('should load deliveries on the scope.', function () {
        scope.$apply();
        expect(scope.deliveryNodes.length).toBe(1);
        expect(scope.deliveryNodes).toContain(node);
    });

    it('should fetch item details and put them on scope', function () {
        scope.$apply();
        expect(scope.item).toEqual(fetchedItem);
    });
});