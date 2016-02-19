'use strict';

angular.module('ReportService', ['eums.config'])
    .factory('ReportService', function ($http, $q, EumsConfig) {

        function buildIPDeliveryReportUrlParams(params, pageNo) {
            return assembleQueryUrl(EumsConfig.BACKEND_URLS.ITEM_FEEDBACK_REPORT, params, pageNo)
        }

        function buildItemReportUrlParams(params, pageNo) {
            return assembleQueryUrl(EumsConfig.BACKEND_URLS.IP_FEEDBACK_REPORT_BY_DELIVERY, params, pageNo)
        }

        function buildDeliverFeedbackReportExportUrlParams(params) {
            return assembleQueryUrl(EumsConfig.BACKEND_URLS.DELIVERIES_FEEDBACK_REPORT_EXPORTS, params)
        }

        function buildItemFeedbackReportExportUrlParams(params) {
            return assembleQueryUrl(EumsConfig.BACKEND_URLS.ITEM_FEEDBACK_REPORT_EXPORTS, params)
        }

        function buildStockReportExportUrlParams(params) {
            return assembleQueryUrl(EumsConfig.BACKEND_URLS.STOCK_REPORT_EXPORTS, params)
        }

        function assembleQueryUrl(baseUrl, params, pageNo) {
            var queryParams = jQuery.param(buildSearchParams(params, pageNo));
            var query = queryParams ? '?' + queryParams : '';
            return baseUrl + query;
        }

        function buildSearchParams(params, pageNo) {
            var searchParams = params ? {
                programme_id: params.programmeId,
                consignee_id: params.consigneeId,
                item_description: params.itemDescription,
                po_waybill: params.poWaybill,
                query: params.query,
                location: params.location || params.selectedLocation,
                page: pageNo,
                ip_id: params.ipId || params.selectedIPId,
                tree_position: params.treePosition,
                received: params.received,
                quality: params.quality,
                satisfied: params.satisfied,
                good_condition: params.good_condition,
                status: params.status,
                field: params.field,
                order: params.order,
                outcome: params.selectedOutcomeId,
                consignee: params.selectedIPId,
                fromDate: params.selectedFromDate ? moment(params.selectedFromDate).format('YYYY-MM-DD') : params.selectedFromDate,
                toDate: params.selectedToDate ? moment(params.selectedToDate).format('YYYY-MM-DD') : params.selectedToDate
            } : {};

            var search = {};
            Object.keys(searchParams).forEach(function (key) {
                if (searchParams[key]) {
                    search[key] = searchParams[key];
                }
            });

            return search;
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
                var url = buildIPDeliveryReportUrlParams(params, pageNo);
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
                var url = buildItemReportUrlParams(params, pageNo);
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
                var url = buildIPDeliveryReportUrlParams(params, pageNo);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    }, function () {
                        result.reject();
                    });

                return result.promise
            },

            exportDeliveriesFeedbackReport: function (params) {
                var result = $q.defer();
                var url = buildDeliverFeedbackReportExportUrlParams(params);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    }, function () {
                        result.reject();
                    });
                return result.promise
            },

            exportItemFeedbackReport: function (params) {
                var result = $q.defer();
                var url = buildItemFeedbackReportExportUrlParams(params);
                $http.get(url)
                    .then(function (response) {
                        result.resolve(response.data);
                    }, function () {
                        result.reject();
                    });
                return result.promise
            },

            exportStockReport: function (params) {
                var result = $q.defer();
                var url = buildStockReportExportUrlParams(params);
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
