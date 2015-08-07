'use strict';

angular.module('IpDelivery', ['eums.config', 'ngTable', 'siTable', 'Delivery', 'Loader', 'User', 'Answer'])
    .controller('IpDeliveryController', function ($scope, $location, DeliveryService, LoaderService,
                                                  UserService, AnswerService) {
        $scope.deliveries = [];
        $scope.answers = [];
        $scope.activeDelivery = undefined;
        $scope.hasReceivedDelivery = undefined;

        function loadDeliveries() {
            LoaderService.showLoader();
            DeliveryService.all()
                .then(function (deliveries) {
                    $scope.deliveries = deliveries;
                    LoaderService.hideLoader();
                });
        }

        loadDeliveries();

        UserService.retrieveUserPermissions()
            .then(function (userPermissions) {
                $scope.canConfirm = _isSubarray(userPermissions, [
                    'auth.can_view_distribution_plans',
                    'auth.can_add_textanswer',
                    'auth.change_textanswer',
                    'auth.add_nimericanswer',
                    'auth.change_nimericanswer'
                ]);
            });

        $scope.confirm = function (delivery) {
            LoaderService.showLoader();
            DeliveryService.getDetail(delivery, 'answers')
                .then(function (answers) {
                    $scope.activeDelivery = delivery;
                    $scope.answers = answers;
                    LoaderService.hideLoader();
                });
        };

        $scope.saveAnswers = function () {
            LoaderService.showLoader();
            AnswerService.createWebAnswer($scope.activeDelivery, $scope.answers)
                .then(function () {
                    if (isDeliveryReceived('deliveryReceived', $scope.answers)) {
                        $location.path('/ip-delivery-items/' + $scope.activeDelivery.id);
                    }
                    $scope.answers = [];
                    $scope.activeDelivery = undefined;
                });
        };

        function isDeliveryReceived(questionLabel, answers) {
            var received = answers.find(function (answer) {
                return answer.questionLabel === questionLabel && answer.value === 'Yes';
            });

            return received ? true : false;
        }

        function _isSubarray(mainArray, testArray) {
            var found = [];
            testArray.forEach(function (element) {
                if (mainArray.indexOf(element) != -1) {
                    found.add(element)
                }
            });

            return found.length === testArray.length;
        }
    });


