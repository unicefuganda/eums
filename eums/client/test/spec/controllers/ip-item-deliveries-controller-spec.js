describe('Ip item deliveries', function () {
    var scope, mockDeliveryNodeService;
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

    beforeEach(function () {
        module('IpItemDeliveries');

        mockDeliveryNodeService = jasmine.createSpyObj('DeliveryNodeService', ['filter']);
        inject(function ($controller, $rootScope, $q) {
            scope = $rootScope.$new();
            var routeParams = {itemId: 2};

            mockDeliveryNodeService.filter.and.returnValue($q.when(nodes));

            $controller('IpItemDeliveriesController', {
                $scope: scope,
                DeliveryNodeService: mockDeliveryNodeService,
                $routeParams: routeParams
            });
        });
    });

    it('should load deliveries on the scope.', function () {
        scope.$apply();
        expect(scope.deliveryNodes.length).toBe(1);
        expect(scope.deliveryNodes).toContain(node);
    })
});