'use strict';

angular.module('SalesOrderItem', ['eums.config', 'Item', 'DistributionPlanNode', 'eums.service-factory'])
    .factory('SalesOrderItemService', function ($http, $q, EumsConfig, ItemService, DistributionPlanNodeService, ServiceFactory) {

        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.SALES_ORDER_ITEM,
            propertyServiceMap: {item: ItemService, distributionplannode_set: DistributionPlanNodeService},
            methods: {
                getPOItemforSOItem: function (salesOrderItemID) {
                    var getPurchaseOrderItemPromise = $http.get(EumsConfig.BACKEND_URLS.PO_ITEM_FOR_SO_ITEM + salesOrderItemID + '/');
                    return getPurchaseOrderItemPromise.then(function (response) {
                        return response.data;
                    });
                },
                getTopLevelDistributionPlanNodes: function (salesOrderItem) {
                    var allDistributionPlanNodes = salesOrderItem.distributionplannodeSet;

                    var planNodePromises = [],
                        planNodes = [];

                    allDistributionPlanNodes.forEach(function (node) {
                        var planNodePromise = DistributionPlanNodeService.getPlanNodeDetails(node.id).then(function (planNodeResponse) {
                            return planNodeResponse;
                        });
                        planNodePromises.push(planNodePromise);
                    });

                    planNodePromises.forEach(function (promise) {
                        promise.then(function (plaNode) {
                            planNodes.push(plaNode);
                        });
                    });

                    function hasNoParent(planNode) {
                        return !planNode.parent;
                    }

                    return $q.all(planNodePromises).then(function () {
                        return planNodes.filter(hasNoParent);
                    });

                }

            }
        });
    });
