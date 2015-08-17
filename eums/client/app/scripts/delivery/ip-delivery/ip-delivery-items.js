angular.module('IpDeliveryItems', ['eums.config', 'ngTable', 'siTable', 'Delivery', 'Loader', 'User', 'Answer', 'EumsFilters'])
    .controller('IpDeliveryItemsController', function ($scope, LoaderService, DeliveryService, DeliveryNodeService,
                                                       $routeParams, AnswerService, $location, $q) {

        $scope.activeDelivery = {};

        loadData();

        $scope.saveAnswers = function () {
            LoaderService.showLoader();
            var answerPromises = []
                ;
            $scope.nodeAnswers.forEach(function (nodeAnswer) {
                answerPromises.push(AnswerService.createWebAnswer(nodeAnswer.id, nodeAnswer.answers))
            });

            $q.all(answerPromises)
                .then(function () {
                    $location.path('/ip-deliveries');
                })
                .finally(function () {
                    LoaderService.hideLoader();
                });
        };

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