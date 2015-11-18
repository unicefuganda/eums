'use strict';

angular.module('ReportService', ['eums.config'])
    .factory('ReportService', function ($http, $q, EumsConfig) {

        function buildIPReportUrlParams(params, byItem, pageNo) {
            var reportEndpoint = byItem ? EumsConfig.BACKEND_URLS.ITEM_FEEDBACK_REPORT : EumsConfig.BACKEND_URLS.IP_FEEDBACK_REPORT_BY_DELIVERY;
            var queryParams = jQuery.param(buildSearchParams(params, pageNo));
            var query = queryParams ? '?' + queryParams : '';
            return reportEndpoint + query;
        }

        function buildSearchParams(params, pageNo) {
            var searchParams = params ? {
                programme_id: params.programmeId,
                consignee_id: params.consigneeId,
                item_description: params.itemDescription,
                po_waybill: params.poWaybill,
                query: params.query,
                location: params.location,
                page: pageNo,
                ip_id: params.ipId,
                tree_position: params.treePosition,
                received: params.received,
                quality: params.quality,
                satisfied: params.satisfied
            } : {};

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
                }, function () {
                    result.reject();
                });
                return result.promise
            },

            ipFeedbackReport: function (params, pageNo) {
                var result = $q.defer();
                var url = buildIPReportUrlParams(params, true, pageNo);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    }, function () {
                        result.reject();
                    });
                return result.promise
            },

            ipFeedbackReportByDelivery: function (params, pageNo) {
                var result = $q.defer();
                var url = buildIPReportUrlParams(params, false, pageNo);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    }, function () {
                        result.reject();
                    });

                return result.promise
            },

            itemFeedbackReport: function (params, pageNo) {
                var result = $q.defer();
                var url = buildIPReportUrlParams(params, true, pageNo);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    }, function () {
                        result.reject();
                    });

                return result.promise
            }
        };
    });
