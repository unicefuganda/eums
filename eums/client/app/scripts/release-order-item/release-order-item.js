'use strict';

angular.module('ReleaseOrderItem', ['eums.config', 'eums.service-factory', 'Item'])
    .factory('ReleaseOrderItemService', function ($http, $q, EumsConfig, ServiceFactory, ItemService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM,
            propertyServiceMap: {
                item: ItemService
            },
            methods: {
            }
        });
    });
