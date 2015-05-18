'use strict';

angular.module('ReleaseOrderItem', ['eums.config', 'PurchaseOrderItem'])
    .factory('ReleaseOrderItemService', function ($http, $q, EumsConfig, PurchaseOrderItemService) {
        var release_order_item;

        var fillOutPurchaseOrderItem = function (releaseOrderItem) {
            return PurchaseOrderItemService.get(releaseOrderItem.purchase_order_item).then(function (purchaseOrderItemDetails) {
                releaseOrderItem.purchase_order_item = purchaseOrderItemDetails;
                return releaseOrderItem;
            });
        };

        return {
            getReleaseOrderItem: function (releaseOrderItemID) {
                var getReleaseOrderItemPromise = $http.get(EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM + releaseOrderItemID + '/');
                return getReleaseOrderItemPromise.then(function (response) {
                    release_order_item = response.data;
                    return fillOutPurchaseOrderItem(release_order_item);
                });
            }
        };
    });
