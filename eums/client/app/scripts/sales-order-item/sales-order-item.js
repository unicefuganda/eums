'use strict';

angular.module('SalesOrderItem', ['eums.config', 'Item', 'DistributionPlanNode', 'Consignee'])
    .factory('SalesOrderItemService', function ($http, $q, EumsConfig, ItemService, DistributionPlanNodeService, ConsigneeService) {
        var sales_order_item;

        var fillOutItem = function (lineItem) {
            return ItemService.get(lineItem.item, ['unit']).then(function (itemDetails) {
                lineItem.item = itemDetails;
                return lineItem;
            });
        };

        return {
            getSalesOrderItem: function (salesOrderItemID) {
                var getSalesOrderItemPromise = $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER_ITEM + salesOrderItemID + '/');
                return getSalesOrderItemPromise.then(function (response) {
                    sales_order_item = response.data;
                    return fillOutItem(sales_order_item);
                });
            },
            getPOItemforSOItem: function (salesOrderItemID) {
                var getPurchaseOrderItemPromise = $http.get(EumsConfig.BACKEND_URLS.PO_ITEM_FOR_SO_ITEM + salesOrderItemID + '/');
                return getPurchaseOrderItemPromise.then(function (response) {
                    return response.data;
                });
            },
            getTopLevelDistributionPlanNodes: function (salesOrderItem) {
                var allDistributionPlanNodes = salesOrderItem.distributionplannode_set;

                var planNodePromises = [],
                    planNodes = [];

                allDistributionPlanNodes.forEach(function (nodeId) {
                    var planNodePromise = DistributionPlanNodeService.getPlanNodeById(nodeId).then(function (planNodeResponse) {
                            var planNode = planNodeResponse.data;
                            return ConsigneeService.getConsigneeById(planNode.consignee).then(function (consigneeResponse) {
                                planNode.consignee_name = consigneeResponse.name;
                                return planNode;
                            });
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
        };
    });
