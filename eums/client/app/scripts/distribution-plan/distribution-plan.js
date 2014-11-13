'use strict';


angular.module('DistributionPlan', ['Contact', 'eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'SalesOrder'])
    .controller('DistributionPlanController', function ($scope, ContactService, $location, DistributionPlanService, ProgrammeService, SalesOrderService, $sorter) {

        $scope.sortBy = $sorter;
        $scope.contact = {};
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.salesOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        function reduceSalesOrder(salesOrders) {
            return _.remove(salesOrders, function (salesOrder, index) {
                return index > 80;
            });
        }

        $scope.initialize = function () {
            this.sortBy('order_number');
            this.sort.descending = false;

            SalesOrderService.getSalesOrders().then(function (salesOrders) {
                var sortedSalesOrder = salesOrders.sort();
                $scope.salesOrders = $location.path() === '/distribution-plans' ? sortedSalesOrder : reduceSalesOrder(sortedSalesOrder);
            });
        };

        $scope.sortArrowClass = function (criteria) {
            var output = '';

            if (this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if (this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.selectSalesOrder = function (selectedSalesOrder) {
            if ($location.path() === '/delivery-reports') {
                $location.path('/delivery-report/new/' + selectedSalesOrder.id);
            } else {
                $location.path('/distribution-plan/new/' + selectedSalesOrder.id);
            }
        };

        $scope.showDistributionPlan = function (planId) {
            $scope.planId = planId;
        };
    }).factory('DistributionPlanService', function ($http, $q, EumsConfig, DistributionPlanNodeService) {
        var fillOutNode = function (nodeId, plan) {
            return DistributionPlanNodeService.getPlanNodeDetails(nodeId)
                .then(function (nodeDetails) {
                    plan.nodeList.push(nodeDetails);
                });
        };

        var buildNodeTree = function (plan) {
            var rootNode = plan.nodeList.filter(function (node) {
                return node.parent === null;
            })[0];

            if (rootNode) {
                plan.nodeTree = addChildrenDetail(rootNode, plan);
                delete plan.nodeList;
            }
        };

        var addChildrenDetail = function (node, plan) {
            if (node) {
                node.temporaryChildrenList = [];
                node.children.forEach(function (childNodeId) {
                    var descendant = findDetailedNode(childNodeId, plan);
                    node.temporaryChildrenList.push(descendant);
                    addChildrenDetail(descendant, plan);
                });
                node.children = node.temporaryChildrenList;
                delete node.temporaryChildrenList;
                return node;
            }
        };

        var findDetailedNode = function (nodeId, plan) {
            return plan.nodeList.filter(function (node) {
                return node.id === nodeId;
            })[0];
        };

        var getUniqueLocations = function (consigneesResponsesWithNodeLocation) {
            return _.uniq(consigneesResponsesWithNodeLocation, function (responseWithNodeLocation) {
                return responseWithNodeLocation.location.toLowerCase();
            });
        };

        function aggregateAllResponse(data, location) {
            var totalYes = 0;
            var totalSent = data.length;
            data.forEach(function (response) {
                if (response.productReceived.toLowerCase() === 'yes') {
                    totalYes += 1;
                }
            });

            return {
                location: location ? location : 'Uganda',
                totalSent: totalSent,
                totalReceived: totalYes,
                totalNotReceived: totalSent - totalYes
            };
        }

        function aggregateAllResponseFor(responsesWithLocation, district) {
            var aggregates = {};
            responsesWithLocation.forEach(function (responseWithLocation) {
                if (district.toLowerCase() === responseWithLocation.location.toLowerCase()) {
                    aggregates = aggregateAllResponse(responseWithLocation.consigneeResponses, district);
                }
            });
            return aggregates;
        }

        return {
            fetchPlans: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN);
            },
            getSalesOrders: function () {
                return $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER);

            },
            getNodes: function (plan) {
                var distributionPlanNodesPromises = plan.distributionplannode_set.map(function (nodeId) {
                    return DistributionPlanNodeService.getPlanNodeById(nodeId);
                });
                return $q.all(distributionPlanNodesPromises);
            },
            getAllPlansNodes: function () {
                var self = this, mergedPromises = [];
                return self.fetchPlans().then(function (response) {
                    var nodePlanPromises = response.data.map(function (plan) {
                        return self.getNodes(plan);
                    });

                    return $q.all(nodePlanPromises).then(function (nodePlans) {
                        return mergedPromises.concat.apply(mergedPromises, nodePlans);
                    });
                });
            },

            getConsigneeDetails: function (consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.RESPONSES + consigneeId + '/');
            },
            aggregateResponses: function () {
                return this.getAllConsigneeResponses().then(function (responseFromServer) {
                    return aggregateAllResponse(responseFromServer.data);
                });
            },
            aggregateResponsesForDistrict: function (district) {
                return this.groupResponsesByLocation().then(function (responsesWithLocation) {
                    return aggregateAllResponseFor(responsesWithLocation, district);
                });
            },
            getAllConsigneeResponses: function () {
                return $http.get(EumsConfig.BACKEND_URLS.RESPONSES);
            },
            mapConsigneesResponsesToNodeLocation: function () {
                var self = this;
                return self.getAllConsigneeResponses().then(function (responses) {
                    var consigneeResponseWithLocationPromises = responses.data.map(function (response) {
                        return self.getDistributionPlanNodeById(response.node).then(function (planNodeResponse) {
                            response.location = planNodeResponse.data.location;
                            return response;
                        });
                    });
                    return $q.all(consigneeResponseWithLocationPromises);
                });
            },
            groupResponsesByLocation: function () {
                return this.mapConsigneesResponsesToNodeLocation().then(function (allResponses) {
                    return getUniqueLocations(allResponses).map(function (response) {
                        return {
                            location: response.location.toLowerCase(),
                            consigneeResponses: (function () {
                                return allResponses.filter(function (responseWithLocation) {
                                    return responseWithLocation.location.toLowerCase() === response.location.toLowerCase();
                                });
                            })()
                        };
                    });
                });
            },
            getDistributionPlanNodeById: function (id) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + id + '/');
            },
            getImplementingPartners: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?search=IMPLEMENTING_PARTNER');
            },
            getMiddleMen: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?search=MIDDLE_MAN').then(function (response) {
                    return response.data;
                });
            },
            mapUnicefIpsWithConsignees: function () {
                var self = this;
                return self.getImplementingPartners().then(function (response) {
                    var ipsPromises = response.data.map(function (ipNode) {
                        return {
                            ip: ipNode,
                            consignees: self.getMiddleMen().then(function (response) {
                                var consigneePromises = response.filter(function (childNode) {
                                    return childNode.parent === ipNode.id;
                                });
                                return $q.all(consigneePromises).then(function (consignees) {
                                    return consignees.map(function (consignee) {
                                        return {
                                            consignee: consignee,
                                            answers: $q.all(self.getAllConsigneeResponses().then(function (response) {
                                                return response.data.filter(function (answer) {
                                                    return answer.node === consignee.id;
                                                });
                                            }))
                                        };
                                    });
                                });
                            })
                        };
                    });
                    return $q.all(ipsPromises);
                });
            },
            getNodesBy: function (ipId) {
                return this.getAllPlansNodes().then(function (nodes) {
                    return nodes.filter(function (node) {
                        return parseInt(node.data.parent) === parseInt(ipId);
                    });
                });
            },
            getPlanById: function (planId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN + planId + '/');
            },
            getPlanDetails: function (planId) {
                var getPlanPromise = this.getPlanById(planId);
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
    })
    .directive('ordersTable', [function () {
        return {
            controller: 'DistributionPlanController',
            restrict: 'E',
            scope: {
                onSelect: '&',
                actionable: '@'
            },
            templateUrl: '/static/app/views/distribution-planning/partials/view-sales-orders.html'
        };
    }]).filter('salesOrderFilter', function ($filter) {
        return  function (salesOrders, query) {
            var results = $filter('filter')(salesOrders, {order_number: query});
            results = _.union(results, $filter('filter')(salesOrders, {date: query}));
            results = _.union(results, $filter('filter')(salesOrders, {description: query}));
            return results;
        };
    }).factory('$sorter', function () {
        return function (field) {
            this.sort = this.sort || {};
            angular.extend(this.sort, {criteria: field, descending: !this.sort.descending});
        };
    })
;

