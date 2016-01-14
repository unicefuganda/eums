'use strict';


angular.module('DeliveryStats', ['eums.config', 'SysUtils'])
    .factory('DeliveryStatsService', function ($http, $timeout, SysUtilsService, EumsConfig) {

        function reformatDate(filter){
            var filterCopy = {};
            angular.copy(filter, filterCopy)
            filterCopy.from = SysUtilsService.formatDateToYMD(filterCopy.from);
            filterCopy.to = SysUtilsService.formatDateToYMD(filterCopy.to);
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