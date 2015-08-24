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

            ipFeedbackReport: function (searchTerm) {
                var result = $q.defer();
                var reportEndpoint = EumsConfig.BACKEND_URLS.IP_FEEDBACK_REPORT;
                var query = '?query=' + encodeURI(searchTerm);
                var url = searchTerm? reportEndpoint + query : reportEndpoint;

                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    });

                return result.promise
            }
        };
    });
