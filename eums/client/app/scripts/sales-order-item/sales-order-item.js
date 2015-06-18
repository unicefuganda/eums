'use strict';

angular.module('SalesOrderItem', ['eums.config', 'Item', 'DistributionPlanNode', 'eums.service-factory'])
    .factory('SalesOrderItemService', function ($http, $q, EumsConfig, ItemService, DistributionPlanNodeService, ServiceFactory) {

        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.SALES_ORDER_ITEM,
            propertyServiceMap: {
                item: ItemService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {
                getPOItemforSOItem: function (salesOrderItemID) {
                    var getPurchaseOrderItemPromise = $http.get(EumsConfig.BACKEND_URLS.PO_ITEM_FOR_SO_ITEM + salesOrderItemID + '/');
                    return getPurchaseOrderItemPromise.then(function (response) {
                        return response.data;
                    });
                }
            }
        });
    });
