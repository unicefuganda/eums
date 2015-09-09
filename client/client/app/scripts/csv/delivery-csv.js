angular.module('ExportDeliveries', ['eums.config'])
    .factory('ExportDeliveriesService', function ($http, EumsConfig) {
        var endPoint = EumsConfig.BACKEND_URLS.EXPORT_WAREHOUSE_DELIVERIES;
        return {
            export: function () {
                return $http.get(endPoint);
            }
        };
    });