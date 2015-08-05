'use strict';

angular.module('ReleaseOrderItem', ['eums.config', 'eums.service-factory', 'Item', 'DeliveryNode', 'PurchaseOrderItem'])
    .factory('ReleaseOrderItemService', function ($http, $q, EumsConfig, ServiceFactory, ItemService,
                                                  DeliveryNodeService, PurchaseOrderItemService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM,
            propertyServiceMap: {
                item: ItemService,
                purchase_order_item: PurchaseOrderItemService,
                distributionplannode_set: DeliveryNodeService
            },
            methods: {
                 getTopLevelDeliveryNodes: function (releaseOrderItem) {
                    var allDeliveryNodes = releaseOrderItem.distributionplannodeSet;

                    var planNodePromises = [],
                        planNodes = [];

                    allDeliveryNodes.forEach(function (node) {
                        var planNodePromise = DeliveryNodeService.getPlanNodeDetails(node.id).then(function (planNodeResponse) {
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
