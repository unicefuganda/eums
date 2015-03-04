'use strict';

angular.module('ReleaseOrder', ['eums.config'])
    .factory('ReleaseOrderService', function ($http, EumsConfig) {
        return {
            getReleaseOrders: function () {
                var getOrdersPromise = $http.get(EumsConfig.BACKEND_URLS.RELEASE_ORDER);
                return getOrdersPromise.then(function (response) {
                    return response.data;
                });
            },
            getReleaseOrder: function (id) {
                return $http.get(EumsConfig.BACKEND_URLS.RELEASE_ORDER + id).then(function (response) {
                    return response.data;
                });
            }

        };
    });