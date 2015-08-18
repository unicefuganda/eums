'use strict';

angular.module('ReportService', ['eums.config'])
    .factory('ReportService', function ($http, $q, EumsConfig) {

        function buildReportUrlParams(params) {
            var reportEndpoint = EumsConfig.BACKEND_URLS.IP_FEEDBACK_REPORT;
            var query = params ? '?query=' + encodeURI(params.query) : undefined;
            var page = params ? '?page=' + params.page : undefined;
            var url;

            if (params) {
                if (params.query && params.page) {
                    url = reportEndpoint + query + '&' + page
                } else if (params.query) {
                    url = reportEndpoint + query
                } else if (params.page) {
                    url = reportEndpoint + page
                } else {
                    url = reportEndpoint;
                }
            } else {
                url = reportEndpoint
            }
            return url;
        }

        return {
            allIpResponses: function () {
                var result = $q.defer();
                $http.get(EumsConfig.BACKEND_URLS.IP_RESPONSES).then(function (response) {
                    result.resolve(response.data);
                });
                return result.promise
            },

            ipFeedbackReport: function (params) {
                var result = $q.defer();
                var url = buildReportUrlParams(params);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    });

                return result.promise
            }
        };
    });
