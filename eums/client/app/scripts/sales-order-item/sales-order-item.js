'use strict';

angular.module('SalesOrderItem', ['eums.config', 'Item', 'DistributionPlanNode', 'DistributionPlanLineItem', 'Consignee'])
    .factory('SalesOrderItemService', function ($http, $q, EumsConfig, ItemService, DistributionPlanNodeService, DistributionPlanLineItemService, ConsigneeService) {
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
            getTopLevelDistributionPlanLineItems: function (salesOrderItem) {
                var allDistributionLineItems = salesOrderItem.distributionplanlineitem_set;

                var lineItemPromises = [],
                    lineItems = [];

                allDistributionLineItems.forEach(function (lineItemId) {
                    var lineItemPromise = DistributionPlanLineItemService.getLineItem(lineItemId).then(function (lineItem) {
                        return DistributionPlanNodeService.getPlanNodeById(lineItem.distribution_plan_node).then(function (planNodeResponse) {
                            lineItem.distribution_plan_parent_node = planNodeResponse.data.parent;
                            return lineItem;
                        });
                    });
                    lineItemPromises.push(lineItemPromise);
                });

                lineItemPromises.forEach(function (promise) {
                    promise.then(function (lineItem) {
                        lineItems.push(lineItem);
                    });
                });

                function hasNoParent(lineItem) {
                    return !lineItem.distribution_plan_parent_node;
                }

                function id(lineItem) {
                    return lineItem.id;
                }

                return $q.all(lineItemPromises).then(function () {
                    return lineItems.filter(hasNoParent).map(id);
                });
            },
            getTopLevelDistributionPlanNodes: function (salesOrderItem) {
                var allDistributionLineItems = salesOrderItem.distributionplanlineitem_set;

                var planNodePromises = [],
                    planNodes = [];

                allDistributionLineItems.forEach(function (lineItemId) {
                    var planNodePromise = DistributionPlanLineItemService.getLineItem(lineItemId).then(function (lineItem) {
                        return DistributionPlanNodeService.getPlanNodeById(lineItem.distribution_plan_node).then(function (planNodeResponse) {
                            var planNode = planNodeResponse.data;
                            return ConsigneeService.get(planNode.consignee).then(function (consigneeResponse) {
                                planNode.consignee_name = consigneeResponse.name;
                                return planNode;
                            });
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
