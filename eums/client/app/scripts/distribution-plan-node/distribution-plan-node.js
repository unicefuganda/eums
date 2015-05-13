'use strict';

angular.module('DistributionPlanNode', ['eums.config', 'DistributionPlanLineItem', 'Contact', 'Consignee'])
    .factory('DistributionPlanNodeService', function ($http, $q, EumsConfig, DistributionPlanLineItemService, ContactService, ConsigneeService) {
        var fillOutContactPerson = function (planNode) {
            return ContactService.get(planNode.contact_person_id).then(function (contact) {
                planNode.contact_person = contact;
                return planNode;
            }, function () {
                planNode.contact_person = {firstName: 'No Contact Found'};
                return planNode;
            });
        };

        var fillOutConsignee = function (planNode) {
            return ConsigneeService.getConsigneeById(planNode.consignee).then(function (consignee) {
                planNode.consignee = consignee;
                return planNode;
            });
        };

        var fillOutLineItem = function (lineItemId, node) {
            return DistributionPlanLineItemService.getLineItem(lineItemId)
                .then(function (lineItemDetails) {
                    node.lineItems.push(lineItemDetails);
                });
        };

        var getLineItemsForChild = function (childId, service) {
            return service.getPlanNodeById(childId).then(function (response) {
                var childNode = response.data;
                return childNode.distributionplanlineitem_set;
            });
        };

        return {
            getPlanNodeById: function (planNodeId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + planNodeId + '/');
            },
            getPlanNodeDetails: function (planNodeId) {
                var getPlanNodePromise = this.getPlanNodeById(planNodeId);
                return getPlanNodePromise.then(function (response) {
                    var planNode = response.data;
                    var fillOutPromises = [];
                    fillOutPromises.push(fillOutContactPerson(planNode));
                    fillOutPromises.push(fillOutConsignee(planNode));
                    planNode.lineItems = [];
                    planNode.distributionplanlineitem_set.forEach(function (lineItemId) {
                        fillOutPromises.push(fillOutLineItem(lineItemId, planNode));
                    });

                    return $q.all(fillOutPromises).then(function () {
                        return planNode;
                    });
                });
            },
            getPlanNodeChildLineItems: function (node) {
                var childNodeLineItems = [];
                var children = node.children;

                var promises = [];
                var service = this;
                children.forEach(function (child) {
                    promises.push(getLineItemsForChild(child, service));
                });

                promises.forEach(function(promise) {
                    promise.then(function(array) {
                        childNodeLineItems = childNodeLineItems.concat(array);
                    });
                });

                return $q.all(promises).then(function () {
                    return childNodeLineItems;
                });
            },
            createNode: function (nodeDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE, nodeDetails).then(function (response) {
                    if (response.status === 201) {
                        return response.data;
                    }
                    else {
                        return response;
                    }
                });
            },
            updateNode: function (node) {
                return $http.put(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + node.id + '/', node).then(function (response) {
                    return response.data;
                });
            },
            updateNodeTracking: function (planNodeId, tracking) {
                var getPlanNodePromise = this.getPlanNodeById(planNodeId);
                return getPlanNodePromise.then(function (response) {
                    var planNode = response.data;
                    var lineItemUpdatePromises = [];
                    var lineItemFields = {track: tracking};

                    planNode.distributionplanlineitem_set.forEach(function (lineItemId) {
                        var lineItem = {id: lineItemId};
                        lineItemUpdatePromises.push(DistributionPlanLineItemService.updateLineItemField(lineItem, lineItemFields));
                    });

                    return $q.all(lineItemUpdatePromises);
                });
            }
        };

    });
