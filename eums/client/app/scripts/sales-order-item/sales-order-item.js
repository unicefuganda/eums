'use strict';

angular.module('SalesOrderItem', ['eums.config', 'Item'])
    .factory('SalesOrderItemService', function ($http, EumsConfig, ItemService) {
        var sales_order_item;

        var fillOutItem = function (lineItem) {
                return ItemService.getItemDetails(lineItem.item).then(function (itemDetails) {
                    lineItem.item = itemDetails;
                    return lineItem;
        });
        };

        return {
            getSalesOrderItem: function (salesOrderItemID) {
                var getSalesOrderItemPromise = $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER_ITEM + salesOrderItemID + '/');
                return getSalesOrderItemPromise.then(function (response) {
                    sales_order_item = response.data;
                    return fillOutItem(sales_order_item);
                });
            }
        };
    });
