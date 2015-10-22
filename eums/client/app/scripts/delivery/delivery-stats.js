'use strict';


angular.module('DeliveryStats', ['eums.config'])
    .factory('DeliveryStatsService', function ($http, $timeout, EumsConfig) {
        return {
            getStats: function (filter) {
                return $http.get(EumsConfig.BACKEND_URLS.END_USER_DELIVERY_STATS, {params: filter, cache: true});
            },
            getIpStats: function (filter) {
                return $http.get(EumsConfig.BACKEND_URLS.IP_DELIVERY_STATS, {params: filter});
            }
        }
    });