'use strict';

angular.module('ReleaseOrderItem', ['eums.config', 'eums.service-factory', 'Item', 'DistributionPlanNode', 'PurchaseOrderItem'])
    .factory('ReleaseOrderItemService', function ($http, $q, EumsConfig, ServiceFactory, ItemService,
                                                  DistributionPlanNodeService, PurchaseOrderItemService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM,
            propertyServiceMap: {
                item: ItemService,
                purchase_order_item: PurchaseOrderItemService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {}
        });
    });
