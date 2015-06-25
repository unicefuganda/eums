'use strict';

angular.module('PurchaseOrderItem', ['eums.config', 'eums.service-factory', 'DistributionPlanNode', 'Item'])
    .factory('PurchaseOrderItemService', function (EumsConfig, ServiceFactory, DistributionPlanNodeService, $q, ItemService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM,
            propertyServiceMap: {
                distributionplannode_set: DistributionPlanNodeService,
                item: ItemService
            },
            methods: {}
        });
    });