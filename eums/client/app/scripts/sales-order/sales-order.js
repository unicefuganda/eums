'use strict';

angular.module('SalesOrder', ['eums.config'])
    .factory('SalesOrderService', function ($http, EumsConfig) {
        return {
            getSalesOrder: function (salesOrderID) {
                    var getSalesOrderPromise = $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER + salesOrderID + '/');
                    return getSalesOrderPromise.then(function (response) {
                        return response.data;
                    });
            }
        };
    });
