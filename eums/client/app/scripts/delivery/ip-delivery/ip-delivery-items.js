angular.module('IpDeliveryItems', ['eums.config', 'ngTable', 'siTable', 'Delivery', 'Loader', 'User', 'Answer', 'EumsFilters'])
    .controller('IpDeliveryItemsController', function ($scope, LoaderService, DeliveryService, DeliveryNodeService, $routeParams) {

        $scope.activeDelivery = {};

        loadData();

        function loadData() {
            LoaderService.showLoader();
            DeliveryService.get($routeParams.activeDeliveryId)
                .then(function (delivery) {
                    $scope.shipmentDate = delivery.deliveryDate;
                    $scope.totalValue = delivery.totalValue;
                    $scope.activeDelivery = delivery;
                })
                .then(function () {
                    DeliveryNodeService.filter({distribution_plan: $scope.activeDelivery.id}, ['item'])
                        .then(function (nodes) {
                            $scope.deliveryNodes = nodes;
                        })
                })
                .then(function () {
                    DeliveryService.getDetail($scope.activeDelivery, 'node_answers')
                        .then(function (answers) {
                            $scope.nodeAnswers = answers;
                        })
                })
                .finally(function () {
                    LoaderService.hideLoader();
                });
        }
    });