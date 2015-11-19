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

        $scope.constant_type_delivery = 'delivery'
        $scope.constant_type_item = 'item'
        $scope.constant_type_distribution = 'distribution'

        $scope.remarks = '';
        $scope.type = $scope.constant_type_delivery;

        loadInitialAlerts();

        function loadInitialAlerts() {
            LoaderService.showLoader();
            var urlArgs = {type: $scope.type, paginate: 'true', page: 1};
            AlertsService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
                LoaderService.hideLoader();
            });
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }

        $scope.changeAlertType = function (type) {
            $scope.type = type;
            loadInitialAlerts();
        };

        function setScopeDataFromResponse(response) {
            $scope.alerts = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }

        $scope.goToPage = function (page) {
            LoaderService.showLoader();
            var urlArgs = {type: $scope.type, paginate: 'true', page: page};
            AlertsService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
            }).catch(function () {
                createToast('Failed to load alerts', 'danger');
            }).finally(function () {
                LoaderService.hideLoader()
            });
        };

        $scope.addRemark = function (index) {
            var remarksModalId = 'resolve-alert-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        $scope.showRemark = function (index) {
            var remarksModalId = 'resolved-alert-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        $scope.resolveAlert = function (alertId, alertRemarks) {
            AlertsService.update({id: alertId, remarks: alertRemarks}, 'PATCH')
                .then(function () {
                    AlertsService.get('count').then(function (alertsCount) {
                        $rootScope.unresolvedAlertsCount = alertsCount.unresolved;
                    });
                    loadInitialAlerts();
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
                    createToast('The delivery has been retriggered', 'success');
                    AlertsService.get('count').then(function (alertsCount) {
                        $rootScope.unresolvedAlertsCount = alertsCount.unresolved;
                    });
                    loadInitialAlerts();
                })
                .catch(function () {
                    createToast('Failed to retrigger alert', 'danger');
                })
        };
    });
