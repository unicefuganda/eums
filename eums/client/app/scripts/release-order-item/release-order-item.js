'use strict';

angular.module('ReleaseOrderItem', ['eums.config', 'eums.service-factory', 'Item', 'DistributionPlanNode'])
    .factory('ReleaseOrderItemService', function ($http, $q, EumsConfig, ServiceFactory, ItemService, DistributionPlanNodeService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM,
            propertyServiceMap: {
                item: ItemService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {}
        });
    });
