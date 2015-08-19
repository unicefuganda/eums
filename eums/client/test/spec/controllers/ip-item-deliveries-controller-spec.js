describe('Ip item deliveries', function () {
    var scope, mockDeliveryNodeService;
    var nodes = [{
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
    }];
    beforeEach(function () {
        module('IpItemDeliveries');

        mockDeliveryNodeService = jasmine.createSpyObj('DeliveryNodeService', ['getDeliveriesForItem']);
        inject(function ($controller, $rootScope, $q) {
            scope = $rootScope.$new();

            var result = $q.defer(), routeParams = {itemId: 2};
            result.resolve(nodes);
            mockDeliveryNodeService.getDeliveriesForItem.and.returnValue(result.promise);
            $controller('IpItemDeliveriesController', {
                $scope: scope,
                DeliveryNodeService: mockDeliveryNodeService,
                $routeParams: routeParams
            })
        });
    });

    it('should load deliveries on the scope.', function () {
        scope.$apply();
        expect(scope.deliveryNodes.length).toBe(1);
        expect(scope.deliveryNodes).toContain(nodes[0]);
    })
});