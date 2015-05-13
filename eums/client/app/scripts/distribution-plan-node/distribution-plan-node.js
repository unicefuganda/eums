'use strict';

angular.module('DistributionPlanNode', ['eums.config', 'Contact', 'Consignee'])
    .factory('DistributionPlanNodeService', function ($http, $q, EumsConfig, ContactService, ConsigneeService) {
        var fillOutContactPerson = function (planNode) {
            return ContactService.getContactById(planNode.contact_person_id).then(function (contact) {
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
                    return $q.all(fillOutPromises).then(function () {
                        return planNode;
                    });
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

            getNodeResponse: function (nodeId) {
                return $http.get(EumsConfig.BACKEND_URLS.NODE_RESPONSES + nodeId + '/').then(function (response) {
                    return response.data;
                });
            }
        };
    });
