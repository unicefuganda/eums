angular.module('IpItemDeliveries', ['DeliveryNode'])
    .controller('IpItemDeliveriesController', function ($scope, DeliveryNodeService, ItemService, $routeParams) {
        $scope.deliveryNodes = [];
        var itemId = $routeParams.itemId;

        ItemService.get(itemId).then(function(item){
            $scope.item = item;
        });

        var fieldsToBuild = ['contact_person_id'];
        var filterFields = {consignee_deliveries_for_item: itemId, paginate: true};
        DeliveryNodeService.filter(filterFields, fieldsToBuild).then(function (response) {
            $scope.deliveryNodes = response.results;
        });
    });
