angular.module('ExportReport', ['eums.config'])
    .factory('ExportReportService', function ($http, EumsConfig) {
        var endPoint = EumsConfig.BACKEND_URLS.DELIVERY_EXPORTS;
        var url_filter_by = function(type){return endPoint + '?type=' + type};
        return {
            export: function (type) {
                return $http.get(url_filter_by(type));
            }
        };
    });