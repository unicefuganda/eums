angular.module('IpItemDeliveries', ['DeliveryNode'])
    .controller('IpItemDeliveriesController', function ($scope, DeliveryNodeService, $routeParams) {
        $scope.deliveryNodes = [];

        if ($routeParams.itemId) {
            var fieldsToBuild = ['contact_person_id'];
            var filterFields = {consignee_deliveries_for_item: $routeParams.itemId, paginate: true};
            DeliveryNodeService.filter(filterFields, fieldsToBuild).then(function (response) {
                $scope.deliveryNodes = response.results;
            });
        }
    });
