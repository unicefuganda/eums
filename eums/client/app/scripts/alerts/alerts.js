'use strict';

angular.module('Alerts', ['eums.config', 'eums.service-factory', 'ngToast', 'ui.bootstrap', 'Loader', 'SortBy', 'Sort'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1});
    }])
    .factory('AlertsService', function (EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.ALERTS
        });
    })
    .controller('AlertsController', function ($scope, $rootScope, $q, AlertsService, LoaderService, ngToast, DeliveryService,
                                              SortService, SortArrowService, UserService) {

        var SUPPORTED_FIELD = ['status', 'alertDate', 'dateShipped', 'dateReceived', 'value'];

        $scope.currentUser = {};
        $scope.constant_type_delivery = 'delivery';
        $scope.constant_type_item = 'item';
        $scope.constant_type_distribution = 'distribution';
        $scope.remarks = '';
        $scope.type = $scope.constant_type_delivery;
        $scope.sortTerm = {field: 'alertDate', order: 'desc'};

        initialize();

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm);
        };

        $scope.sortBy = function (sortField) {
            if (_.include(SUPPORTED_FIELD, sortField)) {
                console.log($scope.sortTerm);
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                $scope.goToPage(1);
            }
        };

        $scope.changeAlertType = function (type) {
            $scope.type = type;
            initialize();
        };

        $scope.goToPage = function (page) {
            LoaderService.showLoader();
            loadInitialAlerts(angular.extend({page: page}, changedFilters()));
        };

        $scope.setResolve = function (index) {
            var remarksModalId = 'resolve-confirm-modal-' + index;
            LoaderService.showModal(remarksModalId);
        };

        $scope.remark = function (index) {
            var remarksModalId = 'resolve-alert-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        $scope.resolveAlert = function (alertId, alertRemarks, alertResolve) {
            AlertsService.update({
                    id: alertId,
                    remarks: alertRemarks ? alertRemarks : '',
                    is_resolved: alertResolve
                }, 'PATCH')
                .then(function () {
                    AlertsService.get('count').then(function (alertsCount) {
                        $rootScope.unresolvedAlertsCount = alertsCount.unresolved;
                    });
                    initialize();
                })
        };

        $scope.isActiveAlertType = function (type) {
            return $scope.type == type;
        };

        $scope.isRetriggerBtnAvailable = function (alert) {
            return alert.issue == 'not_received' && !alert.isResolved
        };

        $scope.isRetriggerColumnAvailable = function () {
            for (var i in $scope.alerts) {
                if ($scope.isRetriggerBtnAvailable($scope.alerts[i])) {
                    return true;
                }
            }
            return false;
        };

        $scope.retriggerDelivery = function (runnable_id) {
            DeliveryService.retriggerDelivery(runnable_id)
                .then(function () {
                    createToast('The confirmation to IP has been retriggered.', 'success');
                    AlertsService.get('count').then(function (alertsCount) {
                        $rootScope.unresolvedAlertsCount = alertsCount.unresolved;
                    });
                    initialize();
                })
        };

        function initialize() {
            var promises = [];
            promises.push(loadUserPermissions());
            promises.push(loadCurrentUser());
            $q.all(promises).then(function () {
                LoaderService.showLoader();
                loadInitialAlerts(angular.extend({page: 1}, changedFilters()));
            });
        }

        function loadUserPermissions() {
            return UserService.retrieveUserPermissions().then(function (permissions) {
                $scope.userPermissions = permissions;
                UserService.hasPermission("eums.can_view_alert", $scope.userPermissions).then(function (result) {
                    $scope.can_view = result;
                });
                UserService.hasPermission("eums.change_alert", $scope.userPermissions).then(function (result) {
                    $scope.can_change = result;
                });
            });
        }

        function loadCurrentUser() {
            return UserService.getCurrentUser().then(function (user) {
                $scope.currentUser = user;
            });
        }

        function loadInitialAlerts(urlArgs) {
            $scope.currentPage = urlArgs.page;
            LoaderService.showLoader();
            AlertsService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
            }).finally(function () {
                LoaderService.hideLoader()
            });
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }

        function setScopeDataFromResponse(response) {
            $scope.alerts = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }

        function changedFilters() {
            var urlArgs = {};
            if ($scope.sortTerm.field) {
                urlArgs.field = $scope.sortTerm.field;
                urlArgs.order = $scope.sortTerm.order;
            }

            urlArgs.paginate = 'true';
            if ($scope.type) {
                urlArgs.type = $scope.type;
            }
            return urlArgs
        }
    });
