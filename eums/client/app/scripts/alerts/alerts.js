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
    .controller('AlertsController', function ($scope, AlertsService, LoaderService, ngToast) {

        $scope.remarks = '';

        loadInitialAlerts();
        function loadInitialAlerts() {
            LoaderService.showLoader();
            var urlArgs = {paginate: 'true', page: 1};
            AlertsService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
                LoaderService.hideLoader();
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
        $scope.goToPage = function (page) {
            LoaderService.showLoader();
            var urlArgs = {paginate: 'true', page: page};
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

        $scope.resolveAlert = function (alertId, alertRemarks) {
            AlertsService.update({id: alertId, remarks: alertRemarks}, 'PATCH')
                .then(function () {
                    loadInitialAlerts();
                })
                .catch(function () {
                    createToast('Failed to resolve alert', 'danger')
                })
        };

    });