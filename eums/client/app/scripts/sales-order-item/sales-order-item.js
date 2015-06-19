'use strict';

angular.module('SalesOrderItem', ['eums.config', 'Item', 'DistributionPlanNode', 'eums.service-factory'])
    .factory('SalesOrderItemService', function ($http, $q, EumsConfig, ItemService, DistributionPlanNodeService, ServiceFactory) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.SALES_ORDER_ITEM,
            propertyServiceMap: {
                item: ItemService,
                distributionplannode_set: DistributionPlanNodeService
            }
        });
    });
