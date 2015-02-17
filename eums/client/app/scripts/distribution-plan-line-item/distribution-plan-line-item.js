'use strict';

angular.module('DistributionPlanLineItem', ['eums.config', 'Item'])
    .factory('DistributionPlanLineItemService', function ($http, EumsConfig) {
        return {
            getLineItem: function (lineItemId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM + lineItemId + '/').then(function (response) {
                    return response.data;
                });
            },
            createLineItem: function (lineItemDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM, lineItemDetails).then(function (response) {
                    return response.data;
                });
            },
            updateLineItem: function (lineItem) {
                return $http.put(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM + lineItem.id + '/', lineItem)
                    .then(function (response) {
                        return response.data;
                    });
            },
            updateLineItemField: function (lineItem, lineItemFields) {
                return $http({ method: 'PATCH', url: EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM + lineItem.id + '/', data: lineItemFields})
                    .then(function (response) {
                        return response.data;
                    });
            }
        };
    });


