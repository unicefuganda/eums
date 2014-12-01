'use strict';

angular.module('PurchaseOrderItem', ['eums.config', 'SalesOrderItem'])
    .factory('PurchaseOrderItemService', function ($http, $q, EumsConfig, SalesOrderItemService) {
        var purchase_order_item;

        var fillOutSalesOrderItem = function (salesOrderItem) {
            return SalesOrderItemService.getSalesOrderItem(salesOrderItem.sales_order_item).then(function (salesOrderItemDetails) {
                salesOrderItem.sales_order_item = salesOrderItemDetails;
                return salesOrderItem;
            });
        };

        return {
            getPurchaseOrderItem: function (purchaseOrderItemID) {
                var getPurchaseOrderItemPromise = $http.get(EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM + purchaseOrderItemID + '/');
                return getPurchaseOrderItemPromise.then(function (response) {
                    purchase_order_item = response.data;
                    return fillOutSalesOrderItem(purchase_order_item);
                });
            }
        };
    });
