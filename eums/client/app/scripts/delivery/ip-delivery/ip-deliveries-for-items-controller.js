angular.module('IpDeliveriesForItem', ['DeliveryNode'])
    .controller('IpDeliveriesForItemController', function ($scope, DeliveryNodeService, $routeParams) {
        $scope.deliveryNodes = [];

        if ($routeParams.itemId) {
            DeliveryNodeService.getDeliveriesForItem($routeParams.itemId).then(function (nodes) {
                $scope.deliveryNodes = nodes;
            });
        }
    });
