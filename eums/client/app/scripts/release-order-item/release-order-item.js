'use strict';

angular.module('ReleaseOrderItem', ['eums.config', 'eums.service-factory', 'PurchaseOrderItem'])
    .factory('ReleaseOrderItemService', function ($http, $q, EumsConfig, ServiceFactory, PurchaseOrderItemService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM,
            propertyServiceMap: {'purchase_order_item': PurchaseOrderItemService},
            methods: {}
        });
    });
