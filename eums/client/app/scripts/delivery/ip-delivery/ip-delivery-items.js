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

        $scope.$watch('nodeAnswers', function () {
            var areValid = [];
            if ($scope.nodeAnswers) {
                $scope.nodeAnswers.forEach(function (nodeAnswer) {
                    areValid.push(_areValidAnswers(nodeAnswer.answers))
                });
                $scope.areValidAnswers = areValid.indexOf(false) <= -1;
            }
        }, true);

        function _areValidAnswers(nodeAnswers) {
            var isValid = [];
            nodeAnswers.forEach(function (nodeAnswer) {
                if (nodeAnswer.question_label == 'additionalComments') {
                    isValid.add(true);
                } else {
                    if (nodeAnswer.type == 'multipleChoice') {
                        isValid.add(nodeAnswer.options.indexOf(nodeAnswer.value) > -1);
                    } else if (nodeAnswer.type == 'text') {
                        isValid.add(nodeAnswer.value != '');
                    } else if (nodeAnswer.type == 'numeric') {
                        isValid.add(angular.isNumber(nodeAnswer.value) && nodeAnswer.value != '' && nodeAnswer.value.valueOf() >= 0)
                    }
                }

            });

            return isValid.indexOf(false) <= -1;
        }


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