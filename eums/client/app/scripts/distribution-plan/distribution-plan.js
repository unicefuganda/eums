'use strict';


angular.module('DistributionPlan', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives'])
    .controller('DistributionPlanController', function ($scope, $location, DistributionPlanService, ProgrammeService, PurchaseOrderService, UserService, $sorter) {

        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.salesOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.documentColumnTitle = 'Purchase Order';
        $scope.dateColumnTitle = 'Date Created';

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('order_number');
            this.sort.descending = false;

            PurchaseOrderService.forDirectDelivery().then(function (purchaseOrders) {
                $scope.salesOrders = purchaseOrders.sort();
                angular.element('#loading').modal('hide');
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
            $location.path('/distribution-plan/new/' + selectedSalesOrder.id);
        };

    })
    .factory('DistributionPlanService', function ($http, $q, $timeout, EumsConfig, DistributionPlanNodeService) {
        //TODO remove this
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

        function aggregateAllResponses(data, location) {
            var totalSent = data.length;
            var totalYes = data.reduce(function (total, current) {
                return current.productReceived && current.productReceived.toLowerCase() === 'yes' ? total + 1 : total;
            }, 0);

            return {
                location: location,
                totalSent: totalSent,
                totalReceived: totalYes,
                totalNotReceived: totalSent - totalYes
            };
        }

        function aggregateAllResponseFor(responsesWithLocation, district) {
            var aggregates = {};
            responsesWithLocation.forEach(function (responseWithLocation) {
                if (district.toLowerCase() === responseWithLocation.location.toLowerCase()) {
                    aggregates = aggregateAllResponses(responseWithLocation.consigneeResponses, district);
                }
            });
            return aggregates;
        }

        function compareReceiptDate(firstResponse, secondResponse) {
            return moment(firstResponse.dateOfReceipt, 'DD/MM/YYY') - moment(secondResponse.dateOfReceipt, 'DD/MM/YYY');
        }

        function orderResponsesByDateReceived(consigneeResponses) {
            return consigneeResponses.sort(compareReceiptDate);
        }

        function getResponseFor(responsesWithLocation, district) {
            var responses = [];
            if (district) {
                responsesWithLocation.forEach(function (responseWithLocation) {
                    if (district.toLowerCase() === responseWithLocation.location.toLowerCase()) {
                        responses = responseWithLocation.consigneeResponses;
                    }
                });
            } else {
                responsesWithLocation.forEach(function (responseWithLocation) {
                    responses.push(responseWithLocation.consigneeResponses);
                });
            }
            return _.flatten(responses);
        }

        return {
            aggregateStats: function (data, location) {
                //TODO Remove. This should happen at the backend
                return aggregateAllResponses(getResponseFor(data, location), location);
            },
            //TODO This should be all:
            fetchPlans: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN, {cache: true});
            },
            //TODO Remove. Clients should get nodes when they get the plan
            getNodes: function (plan) {
                var distributionPlanNodesPromises = plan.distributionplannode_set.map(function (nodeId) {
                    return DistributionPlanNodeService.getPlanNodeById(nodeId);
                });
                return $q.all(distributionPlanNodesPromises);
            },
            getAllPlansNodes: function () {
                var mergedPromises = [];
                return this.fetchPlans().then(function (response) {
                    var nodePlanPromises = response.data.map(function (plan) {
                        return this.getNodes(plan);
                    }.bind(this));

                    return $q.all(nodePlanPromises).then(function (nodePlans) {
                        return mergedPromises.concat.apply(mergedPromises, nodePlans);
                    });
                }.bind(this));
            },

            getConsigneeDetails: function (consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.RESPONSES + consigneeId + '/', {cache: true});
            },
            aggregateResponses: function () {
                return this.getAllEndUserResponses().then(function (responseFromServer) {
                    return aggregateAllResponses(responseFromServer.data);
                });
            },
            aggregateResponsesForDistrict: function (district) {
                return this.groupAllResponsesByLocation().then(function (responsesWithLocation) {
                    return aggregateAllResponseFor(responsesWithLocation, district);
                });
            },
            // TODO: Replace all calls to getAllEndUserResponses to getAllConsigneeResponses
            getAllConsigneeResponses: function () {
                return $http.get(EumsConfig.BACKEND_URLS.RESPONSES, {cache: true});
            },
            getAllEndUserResponses: function () {
                return $http.get(EumsConfig.BACKEND_URLS.END_USER_RESPONSES, {cache: true});
            },
            getResponsesByLocation: function (district) {
                return this.groupAllResponsesByLocation().then(function (responsesWithLocation) {
                    return getResponseFor(responsesWithLocation, district);
                });
            },
            orderAllResponsesByDate: function (district) {
                return this.getResponsesByLocation(district).then(function (responses) {
                    return orderResponsesByDateReceived(responses);
                });
            },
            orderResponsesByDate: function (responsesLocationMap, location) {
                return orderResponsesByDateReceived(getResponseFor(responsesLocationMap, location));
            },
            mapConsigneesResponsesToNodeLocation: function () {
                return this.getAllEndUserResponses().then(function (responses) {
                    return $q.all(responses.data);
                });
            },
            groupResponsesByLocation: function (responses) {
                return getUniqueLocations(responses).map(function (response) {
                    return {
                        location: response.location.toLowerCase(),
                        consigneeResponses: (function () {
                            return responses.filter(function (responseWithLocation) {
                                return responseWithLocation.location.toLowerCase() === response.location.toLowerCase();
                            });
                        })()
                    };
                });
            },
            groupAllResponsesByLocation: function () {
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
            getMiddleMen: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_NODE + '?search=MIDDLE_MAN', {cache: true}).then(function (response) {
                    return response.data;
                });
            },
            getNodesBy: function (ipId) {
                return this.getAllPlansNodes().then(function (nodes) {
                    return nodes.filter(function (node) {
                        return parseInt(node.data.parent) === parseInt(ipId);
                    });
                });
            },
            get: function (planId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN + planId + '/', {cache: true});
            },
            //TODO Remove. Make clients ask to build node_set
            getPlanDetails: function (planId) {
                var getPlanPromise = this.get(planId);
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
            //TODO Remove
            createPlan: function (planDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN, planDetails).then(function (response) {
                    if (response.status === 201) {
                        return response.data;
                    }
                    else {
                        return {error: response};
                    }
                });
            },
            updatePlanTracking: function (planId, tracking) {
                var getPlanPromise = this.get(planId);
                return getPlanPromise.then(function (response) {
                    var plan = response.data;
                    var nodeUpdatePromises = [];

                    plan.distributionplannode_set.forEach(function (nodeId) {
                        //TODO Simplified in node service by removal of line item
                        nodeUpdatePromises.push(DistributionPlanNodeService.updateNodeTracking(nodeId, tracking));
                    });

                    return $q.all(nodeUpdatePromises);
                });
            }
        };
    })
    .filter('salesOrderFilter', function ($filter) {
        return function (salesOrders, query) {
            var results = $filter('filter')(salesOrders, {order_number: query});
            results = _.union(results, $filter('filter')(salesOrders, {date: query}));
            return results;
        };
    }).factory('$sorter', function () {
        return function (field) {
            this.sort = this.sort || {};
            angular.extend(this.sort, {criteria: field, descending: !this.sort.descending});
        };
    });

