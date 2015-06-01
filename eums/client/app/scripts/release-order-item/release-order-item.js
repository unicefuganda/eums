'use strict';

angular.module('ReleaseOrderItem', ['eums.config', 'eums.service-factory'])
    .factory('ReleaseOrderItemService', function ($http, $q, EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM,
            propertyServiceMap: {},
            methods: {}
        });
    });
