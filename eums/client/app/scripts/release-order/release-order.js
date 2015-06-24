'use strict';

angular.module('ReleaseOrder', ['eums.config', 'eums.service-factory', 'ReleaseOrderItem'])
    .factory('ReleaseOrderService', function ($http, EumsConfig, ServiceFactory, ReleaseOrderItemService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER,
            propertyServiceMap: {releaseorderitem_set: ReleaseOrderItemService},
            methods: {}
        });
    });