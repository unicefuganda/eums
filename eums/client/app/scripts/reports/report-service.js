'use strict';

angular.module('ReportService', ['eums.config'])
    .factory('ReportService', function ($http, $q, EumsConfig) {

        function buildIPReportUrlParams(params, byItem) {
            var reportEndpoint = byItem ? EumsConfig.BACKEND_URLS.IP_FEEDBACK_REPORT : EumsConfig.BACKEND_URLS.IP_FEEDBACK_REPORT_BY_DELIVERY;
            var query = params ? '?' + jQuery.param(buildSearchParams(params)) : '';
            return reportEndpoint + query;
        }

        function buildSearchParams(params) {
            var searchParams = {
                programme_id: params.programmeId,
                consignee_id: params.consigneeId,
                item_description: params.itemDescription,
                po_waybill: params.poWaybill,
                query: params.query,
                page: params.page,
                location: params.location
            };

            var search = {};
            Object.keys(searchParams).forEach(function (key) {
                if (searchParams[key]) {
                    search[key] = searchParams[key];
                }
            });

            return search;
        }

        function buildEndUserReportUrlParams(params) {
            var reportEndpoint = EumsConfig.BACKEND_URLS.END_USER_FEEDBACK_REPORT;
            var query = params ? '?' + jQuery.param(buildSearchParams(params)) : '';

            return reportEndpoint + query;
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
                var url = buildIPReportUrlParams(params, true);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    });

                return result.promise
            },

            ipFeedbackReportByDelivery: function (params) {
                var result = $q.defer();
                var url = buildIPReportUrlParams(params, false);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    });

                return result.promise
            },

            endUserFeedbackReport: function (params) {
                var result = $q.defer();
                var url = buildEndUserReportUrlParams(params);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    });

                return result.promise
            }
        };
    });
