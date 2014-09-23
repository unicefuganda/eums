'use strict';

angular.module('DistributionPlan', ['Contact', 'eums.config', 'DistributionPlanNode'])
    .controller('DistributionPlanController', function ($scope, ContactService, $location, DistributionPlanService, $sce) {
        $scope.contact = {};
        $scope.errorMessage = '';

        $scope.distribution_plans = [];
        $scope.distribution_plan_details = [];

        $scope.initialize = function () {
            DistributionPlanService.fetchPlans().then(function (response) {
                $scope.distribution_plans = response.data;
            });
        };

        $scope.renderHtml = function () {
            var htmlToAppend = '';
            var nodeDetails = $scope.distribution_plan_details.nodes;
            nodeDetails.forEach(function (nodeDetail) {
                htmlToAppend += '<div class="node" id="nodeDetail' + nodeDetail.id + '">' + nodeDetail.consignee.name + '</div>';
            });
            $scope.htmlToAppend = $sce.trustAsHtml(htmlToAppend);
        };

        $scope.showDistributionPlan = function (planId) {
            DistributionPlanService.getPlanDetails(planId).then(function (response) {
                $scope.distribution_plan_details = {'nodes': response.nodes, 'lineItems': response.nodes[0].lineItems};
                $scope.renderHtml();
            });
        };

        $scope.addContact = function () {
            ContactService.addContact($scope.contact).then(function () {
                $location.path('/');
            }, function (error) {
                $scope.errorMessage = error.data.error;
            });
        };
    }).factory('DistributionPlanService', function ($http, $q, EumsConfig, DistributionPlanNodeService) {
        var fillOutNode = function (nodeId, plan) {
            return DistributionPlanNodeService.getPlanNodeDetails(nodeId)
                .then(function (nodeDetails) {
                    plan.nodeList.push(nodeDetails);
                });
        };

        var buildNodeTree = function(plan) {
            var rootNode = plan.nodeList.filter(function(node) {
                return node.parent === null;
            })[0];
            plan.nodeTree = addChildrenDetail(rootNode, plan);
            delete plan.nodeList;
        };

        var addChildrenDetail = function(node, plan) {
            node.temporaryChildrenList = [];
            node.children.forEach(function(childNodeId) {
                var descendant = findDetailedNode(childNodeId, plan);
                node.temporaryChildrenList.push(descendant);
                addChildrenDetail(descendant, plan);
            });
            node.children = node.temporaryChildrenList;
            delete node.temporaryChildrenList;
            return node;
        };

        var findDetailedNode = function (nodeId, plan) {
            return plan.nodeList.filter(function (node) {
                return node.id === nodeId;
            })[0];
        };

        return {
            fetchPlans: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN);
            },
            getPlanDetails: function (planId) {
                var getPlanPromise = $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN + planId + '/');
                return getPlanPromise.then(function (response) {
                    var plan = response.data;
                    var nodeFillOutPromises = [];

                    plan.nodeList = [];
                    plan.distributionplannode_set.forEach(function (nodeId) {
                        nodeFillOutPromises.push(fillOutNode(nodeId, plan));
                    });

                    return $q.all(nodeFillOutPromises).then(function () {
                        buildNodeTree(plan);
                        return plan;
                    });
                });
            },
            createPlan: function (planDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN, planDetails).then(function (response) {
                    if (response.status === 201) {
                        return response.data;
                    }
                    else {
                        return {error: response};
                    }
                });
            }
        };
    });

