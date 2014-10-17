'use strict';

angular.module('DistributionPlanLineItem', ['eums.config', 'Item'])
    .factory('DistributionPlanLineItemService', function($http, EumsConfig) {

        var getLineItem = function(lineItemId) {
            return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM + lineItemId + '/').then(function(response) {
                return response.data;
            });
        };

        return {
            getLineItem: function(lineItemId) {
                return getLineItem(lineItemId);
            },
            createLineItem: function(lineItemDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM, lineItemDetails);
            },
            updateLineItem: function(lineItem) {
                return $http.put(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM + lineItem.id + '/', lineItem)
                    .then(function(response) {
                        return response.data;
                    });
            }
        };
    });


