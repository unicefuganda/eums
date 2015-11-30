'use strict';

angular.module('IpDelivery', ['eums.config', 'ngTable', 'siTable', 'Delivery', 'Loader', 'User', 'Answer', 'EumsFilters'])
    .controller('IpDeliveryController', function ($scope, $location, DeliveryService, LoaderService,
                                                  UserService, AnswerService, $timeout) {
        $scope.deliveries = [];
        $scope.answers = [];
        $scope.oringalAnswers = [];
        $scope.activeDelivery = undefined;
        $scope.hasReceivedDelivery = undefined;
        var questionLabel = 'deliveryReceived';
        $scope.searchFields = ['number', 'date'];

        function loadDeliveries(urlArgs) {
            LoaderService.showLoader();
            DeliveryService.all(undefined, urlArgs)
                .then(function (deliveries) {
                    $scope.deliveries = deliveries;
                    if(urlArgs) {
                        if(urlArgs.from) {
                            $scope.fromDate = moment(Date.parse(urlArgs.from)).format('DD-MMM-YYYY');
                            initializing = true;
                        }

                        if(urlArgs.to) {
                            $scope.toDate = moment(Date.parse(urlArgs.to)).format('DD-MMM-YYYY');
                            initializing = true;
                        }
                    }
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
            $scope.activeDelivery = delivery;
            DeliveryService.getDetail(delivery, 'answers')
                .then(function (answers) {
                    LoaderService.hideLoader();
                    $scope.activeDelivery = delivery;
                    $scope.answers = answers;
                    $scope.oringalAnswers = angular.copy(answers);
                    LoaderService.showModal('ip-acknowledgement-modal');
                });
        };

        $scope.saveAnswers = function () {
            var answers;
            LoaderService.showLoader();
            answers = _isDeliveryReceived(questionLabel, $scope.answers) ? $scope.answers : [$scope.answers.first()];
            AnswerService.createWebAnswer($scope.activeDelivery, answers)
                .then(function () {
                    if (_isDeliveryReceived(questionLabel, $scope.answers)) {
                        $location.path('/items-delivered-to-ip/' + $scope.activeDelivery.id);
                    } else {
                        loadDeliveries();
                    }
                    $scope.answers = [];
                    $scope.activeDelivery = undefined;
                    LoaderService.hideLoader();
                });
        };

        function validateAnswers(newAnswers) {
            if ($scope.hasReceivedDelivery) {
                return _areValidAnswers($scope.answers);
            }
            return !angular.equals(newAnswers.first(), $scope.oringalAnswers.first()) && _isValidChoice($scope.answers);
        }

        $scope.$watch('answers', function (newAnswers) {
            $scope.hasReceivedDelivery = $scope.answers && _isDeliveryReceived(questionLabel, $scope.answers);
            $scope.isValidChoice = validateAnswers(newAnswers);
        }, true);

        function _isDeliveryReceived(questionLabel, answers) {
            var received = answers.find(function (answer) {
                return answer.question_label === questionLabel && answer.value === 'Yes';
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

        function _areValidAnswers(answers) {
            var isValid = [];
            answers.forEach(function (answer) {
                if (answer.question_label == 'additionalDeliveryComments') {
                    isValid.add(true);
                }
                else {
                    if (answer.type == 'multipleChoice') {
                        isValid.add(answer.options.indexOf(answer.value) > -1);
                    } else if (answer.type == 'text') {
                        isValid.add(answer.value != '');
                    }
                }
            });
            return isValid.indexOf(false) <= -1;
        }

        function _isValidChoice(answers) {
            return answers.length > 0 ? answers.first().options.indexOf(answers.first().value) > -1 : false;
        }

        var timer, initializing = true;

        $scope.$watch('[fromDate,toDate,query]', function () {
            if (initializing){
                initializing = false;
            }
            else {
                if (timer) {
                    $timeout.cancel(timer);
                }
                delaySearch();
            }
        }, true);

        function delaySearch() {
            timer = $timeout(function () {
                loadDeliveries(changedFilters());
            }, 2000);
        }

        function changedFilters() {
            var urlArgs = {};
            if ($scope.fromDate) {
                urlArgs.from = formatDate($scope.fromDate);
            }
            if ($scope.toDate) {
                urlArgs.to = formatDate($scope.toDate);
            }
            if ($scope.query) {
                urlArgs.query = $scope.query;
            }
            return urlArgs
        }

        function formatDate(date) {
            return moment(date).format('YYYY-MM-DD')
        }
    });


