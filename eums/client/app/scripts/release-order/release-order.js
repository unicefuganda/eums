'use strict';

angular.module('ReleaseOrder', ['eums.config', 'PurchaseOrder'])
    .factory('ReleaseOrderService', function ($http, EumsConfig, PurchaseOrderService) {
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
                    return PurchaseOrderService.getPurchaseOrder(order.purchase_order).then(function (purchase_order) {
                        order.purchase_order = purchase_order;
                        return order;
                    });
                });
            }

        };
    });