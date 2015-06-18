'use strict';

angular.module('PurchaseOrderItem', ['eums.config', 'SalesOrderItem', 'eums.service-factory', 'DistributionPlanNode'])
    .factory('PurchaseOrderItemService', function (EumsConfig, SalesOrderItemService, ServiceFactory, DistributionPlanNodeService, $q) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM,
            propertyServiceMap: {
                sales_order_item: SalesOrderItemService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {
                getTopLevelDistributionPlanNodes: function (purchaseOrderItem) {
                    var allDistributionPlanNodes = purchaseOrderItem.distributionplannodeSet;

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