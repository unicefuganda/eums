'use strict';

angular.module('SalesOrder', ['eums.config', 'Programme'])
    .factory('SalesOrderService', function ($http, EumsConfig, ProgrammeService) {
        return {
            getSalesOrders: function () {
                var getOrdersPromise = $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER);
                return getOrdersPromise.then(function (response) {
                    return response.data;
                });
            },
            getSalesOrder: function (id) {

                return $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER + id).then(function (response) {
                    var order = response.data;
                    return ProgrammeService.get(order.programme).then(function (programme) {
                        order.programme = programme;
                        return order;
                    });
                });
            }

        };
    });