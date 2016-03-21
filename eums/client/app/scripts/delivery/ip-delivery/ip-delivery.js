'use strict';

angular.module('IpDelivery', ['eums.config', 'ngTable', 'siTable', 'Delivery', 'Loader', 'User', 'Answer', 'EumsFilters',
        'eums.ip', 'Contact', 'ngToast', 'SystemSettingsService', 'SysUtils', 'angularFileUpload', 'FileUploadService'])
    .controller('IpDeliveryController', function ($scope, $location, $q, ngToast, DeliveryService, LoaderService, SystemSettingsService,
                                                  UserService, AnswerService, $timeout, IPService, ContactService,
                                                  SysUtilsService, FileUploader, FileUploadService) {
        var timer, initializing = true,
            questionLabel = 'deliveryReceived',
            imageUploader = null,
            selectedFiles = [];

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
        $scope.uploadedImages = [];

        init();

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
            if (!delivery) {
                return;
            }

            clearContactAndLocation();
            $scope.activeDelivery = delivery;
            $scope.isInitContactEmpty = delivery.contactPersonId == null;

            LoaderService.showLoader();
            DeliveryService.getDetail(delivery, 'answers/').then(function (answers) {
                $scope.answers = answers;
                $scope.oringalAnswers = angular.copy(answers);
                $scope.selectedLocation.id = delivery.location;
                $scope.contact.id = delivery.contactPersonId;
                setLocationAndContactFields();
                getImages(delivery.id).then(function () {
                    LoaderService.hideLoader();
                    LoaderService.showModal('ip-acknowledgement-modal');
                });
            }).catch(function () {
                LoaderService.hideLoader();
            });
        };

        $scope.saveAnswers = function () {
            if (isContactOrLocationInvalid()) {
                return;
            }
            if (selectedFiles && selectedFiles.length > 0 && $scope.hasReceivedDelivery) {
                imageUploader.uploadAll();
            } else {
                saveAnswer();
            }
        };

        $scope.startAddingFile = function () {
            $scope.fileError = "";
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

        function init() {
            initUpload();
            var promises = [];
            promises.push(loadUserPermissions());
            promises.push(SystemSettingsService.getSettingsWithDefault());
            $q.all(promises).then(function (returns) {
                $scope.systemSettings = returns[1];
                loadDeliveries();
                IPService.loadAllDistricts().then(function (response) {
                    $scope.districts = response.data.map(function (district) {
                        return {id: district, name: district};
                    });
                    $scope.districtsLoaded = true;
                });
            });
        }

        function loadUserPermissions() {
            return UserService.retrieveUserPermissions().then(function (permissions) {
                $scope.userPermissions = permissions;
                $scope.canConfirm = _isSubarray(permissions, [
                    'auth.can_view_distribution_plans',
                    'auth.can_add_textanswer',
                    'auth.change_textanswer',
                    'auth.add_nimericanswer',
                    'auth.change_nimericanswer'
                ]);
                UserService.hasPermission("eums.add_distributionplannode", $scope.userPermissions).then(function (result) {
                    $scope.can_add_distributionplan_node = result;
                });
                UserService.hasPermission("eums.change_distributionplannode", $scope.userPermissions).then(function (result) {
                    $scope.can_change_distributionplan_node = result;
                });
            });
        }

        function loadDeliveries(urlArgs) {
            var promises = [];
            LoaderService.showLoader();
            promises.push(DeliveryService.all(undefined, urlArgs));
            $q.all(promises).then(function (returns) {
                $scope.deliveries = returns[0];
                LoaderService.hideLoader();
            });
        }

        function saveAnswer() {
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

                }).finally(function () {
                LoaderService.hideLoader();
            });
        }

        function getImages(id) {
            return FileUploadService.getImages(id).then(function (response) {
                $scope.uploadedImages = response.images;
                imageUploader.queueLimit = response.images.length < 3 ? 3 - response.images.length : 0;
            });
        }

        function initUpload() {
            var errorList = {
                'queueLimit': 'Sorry, you can only upload 3 pictures',
                'sizeFilter': 'Sorry, the maximum size for each file is 1MB'
            };
            imageUploader = $scope.imageUploader = new FileUploader({
                "url": "api/upload-image/",
                "queueLimit": 3
            });
            $scope.imageRemove = function (image) {
                image.remove();
                $scope.fileError = "";
            };
            imageUploader.filters.push({
                name: 'typeFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            }, {
                name: 'sizeFilter',
                fn: function (item) {
                    return item.size <= 1048576;
                }
            });
            imageUploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
                $scope.fileError = errorList[filter.name];
            };
            imageUploader.onWhenAddingFile = function (item) {
            };
            imageUploader.onAfterAddingAll = function (addedFileItems) {
                selectedFiles = addedFileItems;
            };
            imageUploader.onBeforeUploadItem = function (item) {
                if ($scope.activeDelivery) {
                    item.formData.push({'plan': $scope.activeDelivery.id});
                }
            };
            imageUploader.onCompleteAll = function () {
                saveAnswer();
            };
        }

        function setLocationAndContactFields() {
            if ($scope.contact.id) {
                ContactService.get($scope.contact.id).then(function (contact) {
                    if (!contact) {
                        return;
                    }
                    $('#contact-select').siblings('div').find('a span.select2-chosen').text(contact.firstName + ' ' + contact.lastName);
                });
            }
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
                urlArgs.from = SysUtilsService.formatDateToYMD($scope.fromDate);
            }
            if ($scope.toDate) {
                urlArgs.to = SysUtilsService.formatDateToYMD($scope.toDate);
            }
            if ($scope.query) {
                urlArgs.query = $scope.query;
            }
            return urlArgs
        }

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }
    })
    .filter('strLimit', ['$filter', function ($filter) {
        return function (input, limit) {
            if (!input) return;
            if (input.length <= limit) {
                return input;
            }

            return $filter('limitTo')(input, limit) + '...';
        };
    }])
    .directive('ngThumb', ['$window', function ($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function (item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function (file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function (scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({width: width, height: height});
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }]);
