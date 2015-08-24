'use strict';

angular.module('ReportService', ['eums.config'])
    .factory('ReportService', function ($http, $q, EumsConfig) {
        return {
            allIpResponses: function () {
                var result = $q.defer();
                $http.get(EumsConfig.BACKEND_URLS.IP_RESPONSES).then(function (response) {
                    result.resolve(response.data);
                });
                return result.promise
            },

            ipFeedbackReport: function () {
                var result = $q.defer();
                $http.get(EumsConfig.BACKEND_URLS.IP_FEEDBACK_REPORT)
                    .then(function (response) {
                        result.resolve(response.data);
                });
                return result.promise
            }
        };
    });
