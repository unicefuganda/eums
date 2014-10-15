'use strict';

angular.module('SalesOrder', ['eums.config', 'Programme'])
    .factory('SalesOrderService', function($http, EumsConfig, ProgrammeService) {
        return {
            getSalesOrders: function() {
                var getOrdersPromise = $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER);
                return getOrdersPromise.then(function(response) {
                    return response.data;
                });
            },

            getOrderDetails: function(order) {
                return ProgrammeService.getProgrammeDetails(order.programme).then(function(programmeDetails) {
                    order.programme = programmeDetails;
                    return order;
                });
            }
        };
    });