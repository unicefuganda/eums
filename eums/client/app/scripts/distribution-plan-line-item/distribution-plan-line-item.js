'use strict';

angular.module('DistributionPlanLineItem', ['eums.config', 'Item'])
    .factory('DistributionPlanLineItemService', function($http, EumsConfig) {

        return {
            getLineItemDetails: function(lineItemId) {
                var getLineItemPromise = $http.get(
                        EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM + lineItemId + '/');
                return getLineItemPromise.then(function(response) {
                    return response.data;
                });
            }
        };
    });


