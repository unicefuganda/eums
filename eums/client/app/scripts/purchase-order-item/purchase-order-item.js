'use strict';

angular.module('PurchaseOrderItem', ['eums.config', 'eums.service-factory', 'DistributionPlanNode', 'Item'])
    .factory('PurchaseOrderItem', function () {
        return function (json) {
            !json && (json = {});
            this.id = json.id;
            this.purchaseOrder = json.purchaseOrder;
            this.itemNumber = json.itemNumber;
            this.quantity = json.quantity || 0;
            this.value = json.value || 0;
            this.salesOrderItem = json.salesOrderItem;
            this.item = json.item;
            this.distributionplannodeSet = json.distributionplannodeSet || [];

            this.quantityLeft = function (deliveryNodes) {
                return this.quantity - deliveryNodes.sum(function(node) {
                    return !isNaN(node.targetedQuantity) ? node.targetedQuantity : 0;
                });
            }.bind(this);
        };
    })
    .factory('PurchaseOrderItemService', function (EumsConfig, ServiceFactory, DistributionPlanNodeService, $q,
                                                   ItemService, PurchaseOrderItem) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.PURCHASE_ORDER_ITEM,
            propertyServiceMap: {distributionplannode_set: DistributionPlanNodeService, item: ItemService},
            model: PurchaseOrderItem,
            methods: {
                //TODO Remove this and replace with a backend filter on the delivery node endpoint by parent and item.
                getTopLevelDistributionPlanNodes: function (purchaseOrderItem) {
                    var allDistributionPlanNodes = purchaseOrderItem.distributionplannodeSet;

                    var planNodePromises = [],
                        planNodes = [];

                    allDistributionPlanNodes.forEach(function (node) {
                        var planNodePromise = DistributionPlanNodeService.getPlanNodeDetails(node.id)
                            .then(function (planNodeResponse) {
                                return planNodeResponse;
                            });
                        planNodePromises.push(planNodePromise);
                    });

                    planNodePromises.forEach(function (promise) {
                        promise.then(function (plaNode) {
                            planNodes.push(plaNode);
                        });
                    });

                    return $q.all(planNodePromises).then(function () {
                        return planNodes.filter(function (planNode) {
                            return !planNode.parent;
                        });
                    });
                }
            }
        });
    });