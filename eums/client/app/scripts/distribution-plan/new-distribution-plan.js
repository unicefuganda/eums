'use strict';

angular.module('NewDistributionPlan', ['DistributionPlan', 'eums.config', 'ngTable', 'siTable', 'Programme', 'SalesOrderItem', 'DistributionPlanNode', 'ui.bootstrap', 'Consignee', 'User', 'SalesOrder', 'eums.ip'])
    .controller('NewDistributionPlanController', function ($scope, DistributionPlanParameters, SalesOrderItemService, DistributionPlanLineItemService, DistributionPlanService, DistributionPlanNodeService, ConsigneeService, $q, SalesOrderService, $routeParams, IPService) {

        $scope.datepicker = {};
        $scope.districts = [];

        //TODO: write test for this
        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
        });

        ConsigneeService.fetchConsignees().then(function (consignees) {
            $scope.consignees = consignees;
        });

        $scope.distributionPlanItems = [];
        $scope.salesOrderItems = [];

        $scope.hasSalesOrderItems = false;
        $scope.hasDistributionPlanItems = false;

        SalesOrderService.getSalesOrderBy($routeParams.salesOrderId).then(function (response) {
            $scope.selectedSalesOrder = response.data;

            $scope.selectedSalesOrder.salesorderitem_set.forEach(function (salesOrderItem) {
                SalesOrderItemService.getSalesOrderItem(salesOrderItem).then(function (result) {
                    var formattedSalesOrderItem = {
                        display: result.item.description,
                        materialCode: result.item.material_code,
                        quantity: result.quantity,
                        unit: result.item.unit.name,
                        information: result
                    };
                    formattedSalesOrderItem.quantityLeft = computeQuantityLeft(formattedSalesOrderItem);

                    $scope.salesOrderItems.push(formattedSalesOrderItem);
                });
            });
        });

        $scope.hasTargetedQuantity = function (distributionPlanLineItem) {
            var showInputBox = ['', undefined, '0', 0];
            return (showInputBox.indexOf(distributionPlanLineItem.targetQuantity) === -1);
        };

        $scope.addDistributionPlanItem = function () {
            var distributionPlanLineItem = {
                item: $scope.selectedSalesOrderItem.information.item,
                plannedDistributionDate: '2014-10-10',
                targetQuantity: 0,
                destinationLocation: '',
                modeOfDelivery: '',
                contactPerson: '',
                tracked: false
            };

            $scope.distributionPlanItems.push(distributionPlanLineItem);

            if ($scope.distributionPlanItems && $scope.distributionPlanItems.length > 0) {
                $scope.hasDistributionPlanItems = true;
            }

            setDatePickers();
        };

        function computeQuantityLeft(salesOrderItem) {
            var reduced = $scope.distributionPlanItems.reduce(function (previous, current) {
                return {targetQuantity: previous.targetQuantity + current.targetQuantity};
            }, {targetQuantity: 0});

            return salesOrderItem.quantity - reduced.targetQuantity;
        }

        $scope.$watchCollection('distributionPlanItems', function(newPlanItems) {
            if(newPlanItems.length) {
                $scope.selectedSalesOrderItem.quantityLeft = computeQuantityLeft($scope.selectedSalesOrderItem);
            }
        });

        function setDatePickers() {
            $scope.datepicker = {};
            $scope.distributionPlanItems.forEach(function (item, index) {
                $scope.datepicker[index] = false;
            });
        }

        function getLineItemForUpdateFromUILineItem(uiLineItem) {
            return {
                item: uiLineItem.item.id, targetQuantity: uiLineItem.targetQuantity,
                distribution_plan_node: uiLineItem.distribution_plan_node,
                plannedDistributionDate: uiLineItem.plannedDistributionDate,
                remark: uiLineItem.remark
            };
        }

        function createNewNodeAndLineItem(nodeDetails, lineItem) {
            DistributionPlanNodeService.createNode(nodeDetails).then(function (createdNode) {
                var lineItemDetails = {
                    item: lineItem.item.id,
                    targeted_quantity: lineItem.targetQuantity,
                    distribution_plan_node: createdNode.id,
                    planned_distribution_date: lineItem.plannedDistributionDate,
                    remark: lineItem.remark
                };
                DistributionPlanLineItemService.createLineItem(lineItemDetails).then(function () {
                    $scope.planSaved = true;
                });
            });
        }

        function updateNodeAndLineItem(nodeDetails, lineItem) {
            var nodeSavePromise = DistributionPlanNodeService.updateNode(nodeDetails);
            var lineItemSavePromise = DistributionPlanLineItemService.updateLineItem(lineItem);
            $q.all([nodeSavePromise, lineItemSavePromise]).then(function () {
                $scope.planSaved = true;
            });
        }

        function saveNodeAndLineItem(nodeDetails, uiLineItem, uiItem) {
            var plannedDate = new Date(uiLineItem.plannedDistributionDate);
            uiLineItem.plannedDistributionDate = plannedDate.getFullYear() + '-' + (plannedDate.getMonth() + 1) + '-' + plannedDate.getDate();
            if (uiLineItem.alreadySaved) {
                var lineItemDetails = getLineItemForUpdateFromUILineItem(uiLineItem, nodeDetails);
                lineItemDetails.id = uiItem.lineItemIdInBackend;
                lineItemDetails.item = uiItem.item;
                nodeDetails.id = uiItem.nodeId;
                updateNodeAndLineItem(nodeDetails, lineItemDetails);
            }
            else {
                createNewNodeAndLineItem(nodeDetails, uiLineItem);
            }
        }

        function saveDistributionPlanItems() {
            $scope.distributionPlanItems.forEach(function (item) {
                var nodeDetails = {
                    consignee: item.consignee,
                    location: item.destinationLocation,
                    contact_person_id: item.contactPerson,
                    distribution_plan: $scope.planId,
                    tree_position: 'MIDDLE_MAN',
                    mode_of_delivery: item.modeOfDelivery
                };

                $scope.selectedSalesOrderItem.quantityLeft = (parseInt($scope.selectedSalesOrderItem.quantityLeft) - parseInt(item.targetQuantity)).toString();
                saveNodeAndLineItem(nodeDetails, item, item);
            });
        }

        $scope.saveDistributionPlanItems = function () {
            if ($scope.planId) {
                saveDistributionPlanItems();
            }
            else {
                DistributionPlanService.createPlan({programme: $scope.selectedSalesOrder.programme}).then(function (result) {
                    $scope.planId = result.id;
                    saveDistributionPlanItems();
                });
            }
        };

        $scope.$watch('selectedSalesOrderItem', function () {
            var emptySalesOrders = ['', undefined];
            $scope.distributionPlanItems = [];

            if (emptySalesOrders.indexOf($scope.selectedSalesOrderItem) !== -1) {
                $scope.hasSalesOrderItems = false;
            }
            else {
                $scope.hasSalesOrderItems = true;
                $scope.selectedSalesOrderItem.quantityLeft = $scope.selectedSalesOrderItem.quantity;

                var distributionPlanLineItems = $scope.selectedSalesOrderItem.information.distributionplanlineitem_set;

                if (distributionPlanLineItems && distributionPlanLineItems.length) {
                    $scope.hasDistributionPlanItems = true;
                    var itemCounter = 0;
                    var quantityLeft = parseInt($scope.selectedSalesOrderItem.quantity);

                    distributionPlanLineItems.forEach(function (lineItemId) {
                        DistributionPlanLineItemService.getLineItem(lineItemId).then(function (lineItem) {
                            lineItem.quantity = quantityLeft.toString();
                            lineItem.targetQuantity = lineItem.targeted_quantity;
                            lineItem.lineItemIdInBackend = lineItem.id;

                            var d = new Date(lineItem.planned_distribution_date);
                            lineItem.plannedDistributionDate = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();

                            DistributionPlanNodeService.getPlanNodeDetails(lineItem.distribution_plan_node).then(function (node) {
                                $scope.planId = node.distribution_plan;
                                lineItem.consignee = node.consignee.id;
                                lineItem.nodeId = node.id;
                                lineItem.contactPerson = node.contact_person._id;
                                lineItem.modeOfDelivery = node.mode_of_delivery;
                                lineItem.destinationLocation = node.location;
                                lineItem.alreadySaved = true;
                                lineItem.subConsignees = [
                                    {}
                                ];

                                $scope.distributionPlanItems.push(lineItem);
                            });

                            quantityLeft = quantityLeft - parseInt(lineItem.targetQuantity);
                            itemCounter++;
                            $scope.selectedSalesOrderItem.quantityLeft = quantityLeft.toString();
                        });
                    });
                }
                else {
                    $scope.distributionPlanItems = [];
                }
            }
            setDatePickers();
        });

    }).directive('searchContacts', function ($http, EumsConfig, ContactService, $timeout) {
        function formatResponse(data) {
            return data.map(function (contact) {
                return {
                    id: contact._id,
                    text: contact.firstName + ' ' + contact.lastName
                };
            });
        }

        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, element, _, ngModel) {

                element.select2({
                    minimumInputLength: 1,
                    width: '150px',
                    query: function (query) {
                        var data = {results: []};
                        ContactService.getContactsBySearchQuery(query.term).then(function (foundContacts) {
                            data.results = formatResponse(foundContacts);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            if (modelValue) {
                                ContactService.getContactById(modelValue).then(function (contact) {
                                    if (contact._id) {
                                        callback({
                                            id: contact._id,
                                            text: contact.firstName + ' ' + contact.lastName
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

                element.change(function () {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });
            }
        };
    })
    .directive('searchFromList', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var list = JSON.parse(attrs.list);

                element.select2({
                    width: '100%',
                    query: function (query) {
                        var data = {results: []};
                        var matches = list.filter(function (item) {
                            return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                        });
                        data.results = matches.map(function (match) {
                            return {
                                id: match.id,
                                text: match.name
                            };
                        });
                        query.callback(data);
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var matchingItem = list.filter(function (item) {
                                return item.id === ngModel.$modelValue;
                            })[0];
                            if (matchingItem) {
                                callback({id: matchingItem.id, text: matchingItem.name});
                            }
                        });
                    }
                });

                element.change(function () {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });
            }
        };
    });