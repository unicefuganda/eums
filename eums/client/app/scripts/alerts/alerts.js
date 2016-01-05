'use strict';

angular.module('Alerts', ['eums.config', 'eums.service-factory', 'ngToast', 'ui.bootstrap', 'Loader'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1});
    }])
    .factory('AlertsService', function (EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.ALERTS
        });
    })
    .controller('AlertsController', function ($scope, $rootScope, AlertsService, LoaderService, ngToast, DeliveryService) {

        $scope.constant_type_delivery = 'delivery';
        $scope.constant_type_item = 'item';
        $scope.constant_type_distribution = 'distribution';
        $scope.remarks = '';
        $scope.type = $scope.constant_type_delivery;

        $scope.changeAlertType = function (type) {
            $scope.type = type;
            initializeCurrentTypeView();
        };

        $scope.goToPage = function (page) {
            LoaderService.showLoader();
            loadInitialAlerts(angular.extend({page: page}, changedFilters()));
        };

        $scope.setResolve = function () {
            var remarksModalId = 'resolve-confirm-modal';
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
                    initializeCurrentTypeView();
                })
                .catch(function () {
                    createToast('Failed to resolve alert', 'danger')
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
                    initializeCurrentTypeView();
                })
                .catch(function () {
                    createToast('Failed to retrigger alert', 'danger');
                })
        };

        initializeCurrentTypeView();

        function initializeCurrentTypeView() {
            loadInitialAlerts(angular.extend({page: 1}, changedFilters()));
        }

        function loadInitialAlerts(urlArgs) {
            $scope.currentPage = urlArgs.page;
            LoaderService.showLoader();
            AlertsService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
            }).catch(function () {
                createToast('Failed to load alerts', 'danger');
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
            urlArgs.paginate = 'true';
            if ($scope.type) {
                urlArgs.type = $scope.type;
            }
            return urlArgs
        }
    });
