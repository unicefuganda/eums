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
            getStats: function (filter) {
                return $http.get(EumsConfig.BACKEND_URLS.END_USER_DELIVERY_STATS, {params: filter, cache: true});
            },
            getIpStats: function (filter) {
                return $http.get(EumsConfig.BACKEND_URLS.IP_DELIVERY_STATS, {params: reformatDate(filter)});
            }
        }
    });