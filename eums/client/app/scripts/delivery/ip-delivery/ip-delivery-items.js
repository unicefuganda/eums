angular.module('IpDeliveryItems', ['eums.config', 'ngTable', 'siTable', 'Delivery', 'Loader', 'User', 'Answer', 'EumsFilters'])
    .controller('IpDeliveryItemsController', function ($scope, LoaderService, DeliveryService, $routeParams) {

        $scope.activeDelivery = {};

        LoaderService.showLoader();
        DeliveryService.get($routeParams.activeDeliveryId, ['distributionplannode_set'])
            .then(function (delivery) {
                $scope.shipmentDate = delivery.deliveryDate;
                $scope.totalValue = delivery.totalValue;
                $scope.deliveryNodes = delivery.distributionplannodeSet;
                $scope.activeDelivery = delivery;
            })
            .then(function () {
                DeliveryService.getDetail($scope.activeDelivery, 'node_answers')
                    .then(function (answers) {
                        $scope.nodeAnswers = answers;
                    })
            });

    });