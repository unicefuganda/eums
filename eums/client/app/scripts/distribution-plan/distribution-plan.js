'use strict';

angular.module('DistributionPlan', ['Contact', 'eums.config', 'DistributionPlanNode'])
    .controller('DistributionPlanController', function($scope, ContactService, $location) {
        $scope.contact = {};
        $scope.errorMessage = '';

        $scope.addContact = function() {
            ContactService.addContact($scope.contact).then(function() {
                $location.path('/');
            }, function(error) {
                $scope.errorMessage = error.data.error;
            });
        };
    }).factory('DistributionPlanService', function($http, $q, EumsConfig, DistributionPlanNodeService) {
        var fillOutNode = function(nodeId, plan) {
            return DistributionPlanNodeService.getPlanNodeDetails(nodeId)
                .then(function(nodeDetails) {
                    plan.nodes.push(nodeDetails);
                });
        };

        return {
            fetchPlans: function() {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN);
            },
            getPlanDetails: function(planId) {
                var getPlanPromise = $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN + planId + '/');
                return getPlanPromise.then(function(response) {
                    var plan = response.data;
                    var nodeFillOutPromises = [];

                    plan.nodes = [];
                    plan.distributionplannode_set.forEach(function(nodeId) {
                        nodeFillOutPromises.push(fillOutNode(nodeId, plan));
                    });

                    return $q.all(nodeFillOutPromises).then(function() {
                        return plan;
                    });
                });
            },
            createPlan: function(planDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN, planDetails).then(function(response) {
                    console.log(response.status);
                    if (response.status === 201) {
                        return response.data;
                    }
                    else {
                        return {error: response}
                    }
                });
            }
        };
    });

