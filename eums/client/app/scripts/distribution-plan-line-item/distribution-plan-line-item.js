'use strict';

angular.module('DistributionPlanLineItem', ['eums.config', 'Item'])
    .factory('DistributionPlanLineItemService', function($http, EumsConfig, ItemService) {
        var fillOutItem = function(lineItem) {
            return ItemService.getItemDetails(lineItem.item).then(function(itemDetails) {
                lineItem.item = itemDetails;
                return lineItem;
            });
        };

        return {
            getLineItemDetails: function(lineItemId) {
                var getLineItemPromise = $http.get(
                        EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_LINE_ITEM + lineItemId + '/');
                return getLineItemPromise.then(function(response) {
                    var lineItem = response.data;
                    return fillOutItem(lineItem);
                });
            }
        };
    });


