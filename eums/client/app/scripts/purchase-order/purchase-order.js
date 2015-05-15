'use strict';

angular.module('PurchaseOrder', ['eums.config', 'SalesOrder'])
    .factory('PurchaseOrderService', function ($http, EumsConfig, SalesOrderService) {
        return {
            getPurchaseOrders: function () {
                var getOrdersPromise = $http.get(EumsConfig.BACKEND_URLS.PURCHASE_ORDER);
                return getOrdersPromise.then(function (response) {
                    return response.data;
                });
            },
            getConsigneePurchaseOrders: function (consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE_PURCHASE_ORDERS + consigneeId).then(function (response) {
                    return response.data;
                });
            },
            getPurchaseOrder: function (id) {
                return $http.get(EumsConfig.BACKEND_URLS.PURCHASE_ORDER + id).then(function (response) {
                    var order = response.data;
                    return SalesOrderService.get(order.sales_order, ['programme']).then(function (sales_order) {
                        order.sales_order = sales_order;
                        return order;
                    });
                });
            },
            getConsigneePurchaseOrder: function (id, consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.PURCHASE_ORDER + id).then(function (response) {
                    var order = response.data;
                    return SalesOrderService.get(order.sales_order, ['programme']).then(function (sales_order) {
                        order.sales_order = sales_order;
                        return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE_PURCHASE_ORDER_ITEMS + consigneeId + '/purchase-order/' + id).then(function (response) {
                            order.purchaseorderitem_set = response.data;
                            return order;
                        });
                    });
                });
            },
            getConsigneePurchaseOrderNode: function (consigneeId, salesOrderItemId) {
                return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE_PURCHASE_ORDER_ITEMS + consigneeId + '/sales-order-item/' + salesOrderItemId).then(function (response) {
                    return response.data;
                });
            }

        };
    });