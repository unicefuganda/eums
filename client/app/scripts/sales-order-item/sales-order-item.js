'use strict';

angular.module('SalesOrderItem', ['eums.config', 'Item', 'DeliveryNode', 'eums.service-factory'])
    .factory('SalesOrderItemService', function ($http, $q, EumsConfig, ItemService, DeliveryNodeService, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.SALES_ORDER_ITEM,
            propertyServiceMap: {
                item: ItemService,
                distributionplannode_set: DeliveryNodeService
            }
        });
    });
