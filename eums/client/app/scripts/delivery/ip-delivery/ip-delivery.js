'use strict';

angular.module('IpDelivery', ['eums.config', 'ngTable', 'siTable', 'Delivery', 'Loader', 'User', 'Answer', 'EumsFilters', 'eums.ip', 'Contact', 'ngToast', 'SystemSettingsService'])
    .controller('IpDeliveryController', function ($scope, $location, $q, ngToast, DeliveryService, LoaderService, SystemSettingsService,
                                                  UserService, AnswerService, $timeout, IPService, ContactService) {

        var timer, initializing = true;
        var questionLabel = 'deliveryReceived';

        $scope.deliveries = [];
        $scope.answers = [];
        $scope.oringalAnswers = [];
        $scope.activeDelivery = undefined;
        $scope.hasReceivedDelivery = undefined;
        $scope.searchFields = ['number', 'date'];

        $scope.districts = [];
        $scope.contact = {};
        $scope.selectedLocation = {};
        $scope.deliveryNodes = [];
        $scope.delivery = {};
        $scope.districtsLoaded = false;

        $scope.notificationMessage = "";


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

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
            $scope.districtsLoaded = true;
        });

        $scope.$on('contact-saved', function (event, contact) {
            $scope.contact = {id: contact._id};
            var contactInput = $('#contact-select');
            var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
            contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);

            contactInput.val(contact._id);

            contact.id = contact._id;
            event.stopPropagation();
        });

        $scope.confirm = function (delivery) {
            clearContactAndLocation();
            LoaderService.showLoader();
            $scope.activeDelivery = delivery;
            $scope.isInitContactEmpty = delivery.contactPersonId == null;

            DeliveryService.getDetail(delivery, 'answers')
                .then(function (answers) {
                    LoaderService.hideLoader();
                    $scope.activeDelivery = delivery;
                    $scope.answers = answers;
                    $scope.oringalAnswers = angular.copy(answers);
                    $scope.selectedLocation.id = delivery.location;
                    $scope.contact.id = delivery.contactPersonId;
                    setLocationAndContactFields();
                    LoaderService.showModal('ip-acknowledgement-modal');
                });
        };

        $scope.saveAnswers = function () {
            if (isContactOrLocationInvalid()) {
                return;
            }
            var answers;
            LoaderService.showLoader();
            confirmToUpdateContactAndLocation();

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

        $scope.toContactPage = function () {
            LoaderService.showLoader();
            $location.path('/contacts');
            LoaderService.hideLoader();
        };

        $scope.$watch('answers', function (newAnswers) {
            $scope.hasReceivedDelivery = $scope.answers && _isDeliveryReceived(questionLabel, $scope.answers);
            $scope.isValidChoice = validateAnswers(newAnswers);
        }, true);

        $scope.$watch('[fromDate,toDate,query]', function () {
            if (initializing) {
                initializing = false;
            }
            else {
                if (timer) {
                    $timeout.cancel(timer);
                }
                delaySearch();
            }
        }, true);


        function loadDeliveries(urlArgs) {
            var promises = [];
            LoaderService.showLoader();
            promises.push(DeliveryService.all(undefined, urlArgs));
            promises.push(SystemSettingsService.getSettings());
            $q.all(promises).then(function (returns) {
                $scope.deliveries = returns[0];
                $scope.notificationMessage = returns[1].notification_message;
                LoaderService.hideLoader();
            });
        }

        function setLocationAndContactFields() {
            if ($scope.contact.id)
                ContactService.get($scope.contact.id)
                    .then(function (contact) {
                        if (contact) {
                            $('#contact-select').siblings('div').find('a span.select2-chosen').text(contact.firstName + ' ' + contact.lastName);
                        }
                    });
            $('#location-select').siblings('div').find('a span.select2-chosen').text($scope.selectedLocation.id);
        }

        function clearContactAndLocation() {
            $scope.selectedLocation.id = null;
            $scope.contact.id = null;
            $('#contact-select').siblings('div').find('a span.select2-chosen').text('')
        }

        function confirmToUpdateContactAndLocation() {
            if ($scope.isInitContactEmpty) {
                $scope.activeDelivery.contact_person_id = $scope.contact.id;
                $scope.activeDelivery.location = $scope.selectedLocation.id;
                $scope.activeDelivery.is_auto_track_confirmed = true;
                return DeliveryService.update($scope.activeDelivery);
            }
        }

        function isContactOrLocationInvalid() {
            if (isInvalid($scope.contact.id) || isInvalid($scope.selectedLocation.id)) {
                createToast('Please fill in required field!', 'danger');
                return true;
            }
            return false;
        }

        function isInvalid(field) {
            $scope.errors = field ? false : true;
            return field ? false : true;
        }

        function validateAnswers(newAnswers) {
            if ($scope.hasReceivedDelivery) {
                return _areValidAnswers($scope.answers);
            }
            return !angular.equals(newAnswers.first(), $scope.oringalAnswers.first()) && _isValidChoice($scope.answers);
        }

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

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }
    });
