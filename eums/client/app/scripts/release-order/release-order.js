'use strict';

angular.module('ReleaseOrder', ['eums.config', 'eums.service-factory'])
    .factory('ReleaseOrderService', function ($http, EumsConfig, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER,
            propertyServiceMap: {},
            methods: {}
        });
    });