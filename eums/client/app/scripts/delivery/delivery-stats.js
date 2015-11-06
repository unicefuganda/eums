'use strict';


angular.module('DeliveryStats', ['eums.config'])
    .factory('DeliveryStatsService', function ($http, $timeout, EumsConfig) {

        function formatDate(date) {
            return date && moment(date).format('YYYY-MM-DD')
        }

        function reformatDate(filter){
            var filterCopy = {};
            angular.copy(filter, filterCopy)
            filterCopy.from = formatDate(filterCopy.from);
            filterCopy.to = formatDate(filterCopy.to);
            return filterCopy;
        }

        return {
            getStatsDetails: function (filter, cache) {
                cache = cache || false;
                return $http.get(EumsConfig.BACKEND_URLS.DELIVERY_STATS_DETAILS, {params: reformatDate(filter), cache: cache});
            },
            getMapStats: function (filter) {
                return $http.get(EumsConfig.BACKEND_URLS.MAP_DELIVERY_STATS, {params: reformatDate(filter)});
            },
            getLatestDeliveries: function (filter) {
                return $http.get(EumsConfig.BACKEND_URLS.LATEST_DELIVERIES, {params: reformatDate(filter)});
            }
        }
    });