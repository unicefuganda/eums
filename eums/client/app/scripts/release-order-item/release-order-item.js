'use strict';

angular.module('ReleaseOrderItem', ['eums.config', 'eums.service-factory', 'Item', 'DistributionPlanNode'])
    .factory('ReleaseOrderItemService', function ($http, $q, EumsConfig, ServiceFactory, ItemService, DistributionPlanNodeService) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.RELEASE_ORDER_ITEM,
            propertyServiceMap: {
                item: ItemService,
                distributionplannode_set: DistributionPlanNodeService
            },
            methods: {
                getTopLevelDistributionPlanNodes: function (releaseOrderItem) {
                    var allDistributionPlanNodes = releaseOrderItem.distributionplannodeSet;

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
