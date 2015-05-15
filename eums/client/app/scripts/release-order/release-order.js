'use strict';

angular.module('ReleaseOrder', ['eums.config', 'PurchaseOrder'])
    .factory('ReleaseOrderService', function ($http, EumsConfig, PurchaseOrderService, SalesOrderService) {
        var fillOutPurchaseOrder = function (releaseOrder) {
            return PurchaseOrderService.getPurchaseOrder(releaseOrder.purchase_order).then(function (purchase_order) {
                releaseOrder.purchase_order = purchase_order;
                return releaseOrder;
            });
        };

        var fillOutSalesOrder = function (releaseOrder) {
            return SalesOrderService.get(releaseOrder.sales_order, ['programme']).then(function (sales_order) {
                releaseOrder.sales_order = sales_order;
                return releaseOrder;
            });
        };

        return {
            getReleaseOrders: function () {
                var getOrdersPromise = $http.get(EumsConfig.BACKEND_URLS.RELEASE_ORDER);
                return getOrdersPromise.then(function (response) {
                    return response.data;
                });
            },
            getReleaseOrder: function (id) {
                return $http.get(EumsConfig.BACKEND_URLS.RELEASE_ORDER + id).then(function (response) {
                    var order = response.data;
                    return fillOutPurchaseOrder(order).then(function (order) {
                        return fillOutSalesOrder(order);
                    });
                });
            }

        };
    });