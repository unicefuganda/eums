'use strict';


angular.module('DeliveryStats', ['eums.config'])
    .factory('DeliveryStatsService', function ($http, $q, $timeout, EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.DELIVERY_STATS
        });
    });