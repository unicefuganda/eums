'use strict';

angular.module('DistributionPlanNode', ['eums.config', 'DistributionPlanLineItem', 'Consignee'])
    .factory('DistributionPlanNodeService', function($http, $q, EumsConfig, DistributionPlanLineItemService, ConsigneeService) {
        var fillOutConsignee = function(planNode) {
            return ConsigneeService.getConsigneeDetails(planNode.consignee).then(function(consigneeDetails) {
                planNode.consignee = consigneeDetails;
                return planNode;
            });
        };

        var fillOutLineItem = function(lineItemId, node) {
            return DistributionPlanLineItemService.getLineItemDetails(lineItemId)
                .then(function(lineItemDetails) {
                    node.lineItems.push(lineItemDetails);
                });
        };

        return {
            getPlanNodeDetails: function(planNodeId) {
                var getPlanNodePromise = $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeId + '/');
                return getPlanNodePromise.then(function(response) {
                    var planNode = response.data;
                    var fillOutPromises = [];
                    fillOutPromises.push(fillOutConsignee(planNode));

                    planNode.lineItems = [];
                    planNode.distributionplanlineitem_set.forEach(function(lineItemId) {
                        fillOutPromises.push(fillOutLineItem(lineItemId, planNode));
                    });

                    return $q.all(fillOutPromises).then(function() {
                        return planNode;
                    });
                });
            },
            createNode: function(nodeDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE, nodeDetails).then(function(response) {
                    if(response.status === 201) {
                        return response.data;
                    }
                    else {
                        return response;
                    }
                });
            }
        };
    });


