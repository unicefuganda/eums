'use strict';


angular.module('DistributionPlan', ['Contact', 'eums.config', 'DistributionPlanNode', 'FlowChart', 'ngTable', 'siTable', 'Programme'])
    .controller('DistributionPlanController', function ($scope, ContactService, $location, DistributionPlanService, DistributionPlanNodeService, flowchart, DistributionPlanParameters, ProgrammeService) {
        var chartDataModel = {nodes: [], connections: []};

        $scope.contact = {};
        $scope.errorMessage = '';
        $scope.nodeErrorMessage = false;
        $scope.node = {};
        $scope.planId = '';

        $scope.distribution_plans = [];
        $scope.distribution_plan_details = [];
        $scope.salesOrders = [];
        $scope.selectedSalesOrders = [];

        $scope.initialize = function () {

            DistributionPlanService.getSalesOrders().then(function (response) {
                $scope.salesOrders = response.data;
                DistributionPlanParameters.saveVariable('salesOrders', $scope.salesOrders);

//                $scope.tableParams = new ngTableParams({
//                    page: 1,
//                    count: 25,
//                    sorting: {
//                        name: 'asc'
//                    }
////                    filter: {
////                        sales_document: ''
////                    }
//                }, {
//                    total: $scope.salesOrders.length,
//                    getData: function ($defer, params) {
//                        // use build-in angular filter
//                        var orderedData = params.sorting() ?
//                            $filter('orderBy')($scope.salesOrders, params.orderBy()) : $scope.salesOrders;
//
////                        var orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
//
////                        params.total(orderedData.length);
//
//                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
//                    }
//                });
            });

            DistributionPlanService.fetchPlans().then(function (response) {
                var distributionPlans = response.data;
                distributionPlans.forEach(function(distributionPlan){
                     ProgrammeService.getProgramme(distributionPlan.programme).then(function(result){
                         distributionPlan.programme = result;
                     });
                    return distributionPlan;
                });

                $scope.distribution_plans = distributionPlans;
            });
        };

        $scope.isChecked = function (salesOrder) {
            var indexOfSalesOrder = $scope.selectedSalesOrders.indexOf(salesOrder);
            if (indexOfSalesOrder !== -1) {
                $scope.selectedSalesOrders.splice(indexOfSalesOrder, 1);
            }
            else {
                $scope.selectedSalesOrders.push(salesOrder);
            }
        };

        $scope.newDistributionPlan = function () {
            $location.path('/distribution-plan/new/');
        };

        $scope.renderChart = function () {
            var nodeTree = $scope.distribution_plan_details.nodeTree;
            var nodeInformation = {
                name: nodeTree.consignee.name,
                id: nodeTree.id,
                x: 10,
                y: 10,
                inputConnectors: [
                    {
                        name: ''
                    }
                ], outputConnectors: [
                    {
                        name: ''
                    }
                ] };
            chartDataModel.nodes.push(nodeInformation);

            buildTree(nodeTree, 0, 10);

        };

        var buildTree = function (node, x_variable, y_variable) {
            x_variable += 200;

            node.children.forEach(function (child) {
                var nodeInformation = {
                    name: child.consignee.name,
                    id: child.id,
                    x: x_variable,
                    y: y_variable,
                    inputConnectors: [
                        {
                            name: ''
                        }
                    ], outputConnectors: [
                        {
                            name: ''
                        }
                    ] };

                var connectionInformation = {
                    source: {
                        nodeID: child.parent,
                        connectorIndex: 0
                    },

                    dest: {
                        nodeID: child.id,
                        connectorIndex: 0
                    }
                };

                chartDataModel.nodes.push(nodeInformation);
                chartDataModel.connections.push(connectionInformation);
                buildTree(child, x_variable, y_variable);
                y_variable += 100;
            });
        };

        $scope.getNextNodeID = function () {
            var nodes = $scope.chartViewModel.data.nodes;
            var nodeIDs = [];
            nodes.forEach(function (node) {
                nodeIDs.push(node.id);
            });

            nodeIDs.sort(function (a, b) {
                return a - b;
            });

            return nodeIDs[nodeIDs.length - 1] + 1;
        };

        $scope.addNodeToFlow = function () {
            DistributionPlanNodeService.createNode({'consignee': '1',
                'parent': $scope.node.consigneeParent.id,
                'distribution_plan': $scope.planId}).then(function (response) {
                if (response.status === undefined) {
                    $scope.hide_modal();
                    var parentDetails = {parentNodeId: $scope.node.consigneeParent.id, parentXCoordinate: $scope.node.consigneeParent.x};
                    chartDataModel = $scope.chartViewModel.data;

                    var nodeInformation = {
                        name: $scope.node.consigneeName,
                        id: $scope.getNextNodeID(),
                        x: parentDetails.parentXCoordinate + 200,
                        y: 210,
                        inputConnectors: [
                            {
                                name: ''
                            }
                        ], outputConnectors: [
                            {
                                name: ''
                            }
                        ] };
                    var connectionInformation = {
                        source: {
                            nodeID: parentDetails.parentNodeId,
                            connectorIndex: 0
                        },

                        dest: {
                            nodeID: nodeInformation.id,
                            connectorIndex: 0
                        }
                    };
                    chartDataModel.nodes.push(nodeInformation);
                    chartDataModel.connections.push(connectionInformation);
                    $scope.chartViewModel = new flowchart.ChartViewModel(chartDataModel);
                    $scope.nodes = chartDataModel.nodes;
                }
                else {
                    $scope.nodeErrorMessage = true;
                }

            }, function (error) {
                $scope.nodeErrorMessage = true;
                $scope.customErrorMessage = (error.data.detail || (error.statusText + '.')) + ' ';

            });
        };

        $scope.showDistributionPlan = function (planId) {
            $scope.planId = planId;

            chartDataModel = {nodes: [], connections: []};
            DistributionPlanService.getPlanDetails(planId).then(function (response) {
                if (response.nodeTree) {
                    $scope.distribution_plan_details = {'nodeTree': response.nodeTree, 'lineItems': response.nodeTree.lineItems};
                    $scope.renderChart();
                    $scope.chartViewModel = new flowchart.ChartViewModel(chartDataModel);
                    $scope.nodes = chartDataModel.nodes;
                }

            });
        };

        $scope.addContact = function () {
            ContactService.addContact($scope.contact).then(function () {
                $location.path('/');
            }, function (error) {
                $scope.errorMessage = error.data.error;
            });
        };
    }).controller('NewDistributionPlanController', function ($scope, ContactService, DistributionPlanParameters, ProgrammeService) {
        $scope.salesOrders = [];
        $scope.selectedSalesOrders = [];

        $scope.initialize = function () {
            $scope.salesOrders = DistributionPlanParameters.retrieveVariable('salesOrders');
            ProgrammeService.fetchProgrammes().then(function(response){
                $scope.programmes = response.data;
            });
        };

        $scope.isChecked = function (salesOrder) {
            var indexOfSalesOrder = $scope.selectedSalesOrders.indexOf(salesOrder);
            if (indexOfSalesOrder !== -1) {
                $scope.selectedSalesOrders.splice(indexOfSalesOrder, 1);
            }
            else {
                $scope.selectedSalesOrders.push(salesOrder);
            }
        };

        $scope.savePlan = function(){

        };
    })
    .factory('DistributionPlanService', function ($http, $q, EumsConfig, DistributionPlanNodeService) {
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

        return {
            fetchPlans: function () {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN);
            },
            getSalesOrders: function () {
                return $http.get(EumsConfig.BACKEND_URLS.SALES_ORDER);

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
    }).directive('addNodeModal', function () {
        return{
            scope: true,
            link: function (scope) {
                scope.show_modal = function () {
                    $('#addNode').modal('show');
                };
                scope.hide_modal = function () {
                    $('#addNode').modal('hide');
                };
            }
        };
    }).factory('DistributionPlanParameters', function () {
        var distributionPlanParameters = {};
        return{
            saveVariable: function (key, value) {
                distributionPlanParameters[key] = value;
            },
            retrieveVariable: function (key) {
                return distributionPlanParameters[key];
            }
        };
    })
;

