'use strict';

angular.module('DistributionPlanNode', ['eums.config', 'Contact', 'Consignee', 'eums.service-factory'])
    .factory('DistributionPlanNodeService', function ($http, $q, EumsConfig, ContactService, ConsigneeService, ServiceFactory) {
        var getPlanNodeDetails = function (planNodeId) {
            var fieldsToBuild = ['consignee', 'contact_person_id', 'children'];
            return this.get(planNodeId, fieldsToBuild).then(function (planNode) {
                planNode.contactPerson = planNode.contactPersonId;
                return planNode;
            });
        };
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE,
            propertyServiceMap: {consignee: ConsigneeService, contact_person_id: ContactService, children: 'self'},
            methods: {
                getNodeResponse: function (nodeId) {
                    return $http.get(EumsConfig.BACKEND_URLS.NODE_RESPONSES + nodeId + '/').then(function (response) {
                        return response.data;
                    });
                },
                getPlanNodeDetails: getPlanNodeDetails,
                getTopLevelDistributionPlanNodes: function (orderItem) {
                    var allDistributionPlanNodes = orderItem.distributionplannodeSet;

                    var planNodePromises = [], planNodes = [];

                    if(allDistributionPlanNodes === undefined){
                        return [];
                    }

                    allDistributionPlanNodes.forEach(function (node) {
                        var planNodePromise = getPlanNodeDetails(node.id).then(function (planNodeResponse) {
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
