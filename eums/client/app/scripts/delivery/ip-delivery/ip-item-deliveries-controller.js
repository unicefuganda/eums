angular.module('IpItemDeliveries', ['DeliveryNode'])
    .controller('IpItemDeliveriesController', function ($scope, DeliveryNodeService, $routeParams) {
        $scope.deliveryNodes = [];

        if ($routeParams.itemId) {
            DeliveryNodeService.getDeliveriesForItem($routeParams.itemId).then(function (nodes) {
                $scope.deliveryNodes = nodes;
            });
        }
    });
