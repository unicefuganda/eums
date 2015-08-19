'use strict';

angular.module('Alerts', ['eums.config', 'eums.service-factory'])
    .factory('AlertsService', function (EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.ALERTS
        });
    })
    .controller('AlertsController', function ($scope, AlertsService) {

        AlertsService.all().then(function (alerts) {
            $scope.alerts = alerts;
        });
    });