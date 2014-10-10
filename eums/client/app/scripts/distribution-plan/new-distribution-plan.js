'use strict';

angular.module('NewDistributionPlan', ['DistributionPlan', 'eums.config', 'ngTable', 'siTable', 'Programme', 'SalesOrderItem', 'DistributionPlanNode'])
    .controller('NewDistributionPlanController', function ($scope, DistributionPlanParameters, SalesOrderItemService, DistributionPlanLineItemService, DistributionPlanService, DistributionPlanNodeService) {

        $scope.salesOrderItems = [];
        $scope.distributionPlanItems = [];

        $scope.initialize = function () {
            $scope.salesOrderItemSelected = undefined;
            $scope.hasSalesOrderItems = false;
            $scope.hasDistributionPlanItems = false;

            $scope.selectedSalesOrder = DistributionPlanParameters.retrieveVariable('selectedSalesOrder');

            $scope.selectedSalesOrder.salesorderitem_set.forEach(function (salesOrderItem) {
                SalesOrderItemService.getSalesOrderItem(salesOrderItem).then(function (result) {
                    var formattedSalesOrderItem = {display: result.item.description,
                        material_code: result.item.material_code,
                        quantity: result.quantity,
                        quantityLeft: result.quantity,
                        unit: result.item.unit.name,
                        information: result};

                    $scope.salesOrderItems.push(formattedSalesOrderItem);
                });
            });
        };

        $scope.hasTargetedQuantity = function (distributionPlanLineItem) {
            var showInputBox = ['', undefined, '0', 0];
            return (showInputBox.indexOf(distributionPlanLineItem.targeted_quantity) === -1);
        };

        $scope.addDistributionPlanItem = function () {
            var distributionPlanLineItem = {item: $scope.salesOrderItemSelected.information.item,
                quantity: $scope.salesOrderItemSelected.quantityLeft, planned_distribution_date: '2014-10-10',
                targeted_quantity: 0, destination_location: '', mode_of_delivery: '',
                contact_phone_number: '', programme_focal: '', contact_person: ''};

            var currentDistributionPlanItems = $scope.distributionPlanItems;
            currentDistributionPlanItems.push(distributionPlanLineItem);

            if (currentDistributionPlanItems && currentDistributionPlanItems.length > 0) {
                $scope.hasDistributionPlanItems = true;
            }

            $scope.distributionPlanItems = currentDistributionPlanItems;
        };

        function saveNodeAndLineItems(nodeDetails, distributionPlanItem) {
            DistributionPlanNodeService.createNode(nodeDetails).then(function (response) {
                var lineItemDetails = {item: distributionPlanItem.item.id, targeted_quantity: distributionPlanItem.targeted_quantity,
                    distribution_plan_node: response.id, planned_distribution_date: distributionPlanItem.planned_distribution_date,
                    programme_focal: distributionPlanItem.programme_focal.id, consignee: distributionPlanItem.consignee.id,
                    contact_person: distributionPlanItem.contact_person, contact_phone_number: distributionPlanItem.contact_phone_number,
                    destination_location: distributionPlanItem.destination_location, mode_of_delivery: distributionPlanItem.mode_of_delivery,
                    tracked: distributionPlanItem.tracked, remark: distributionPlanItem.remark};
                DistributionPlanLineItemService.createLineItem(lineItemDetails);
            });
        }

        function saveScopeVariables(distributionPlanItems) {
            $scope.salesOrderItemSelected.quantityLeft = $scope.salesOrderItemSelected.quantity;
            $scope.distributionPlanItems = distributionPlanItems;
        }

        $scope.saveDistributionPlanItem = function (distributionPlanItems) {
            if ($scope.planId === undefined) {
                DistributionPlanService.createPlan({programme: $scope.selectedSalesOrder.programme}).then(function (result) {
                    $scope.planId = result.id;
                });
            }
            saveScopeVariables(distributionPlanItems);

            $scope.distributionPlanItems.forEach(function (distributionPlanItem) {
                var nodeDetails = {consignee: distributionPlanItem.consignee.id,
                    distribution_plan: $scope.planId, tree_position: 'END_USER'};

                $scope.salesOrderItemSelected.quantityLeft = (parseInt($scope.salesOrderItemSelected.quantityLeft) - parseInt(distributionPlanItem.target_quantity)).toString();
                saveNodeAndLineItems(nodeDetails, distributionPlanItem);
            });
        };

        $scope.$watch('salesOrderItemSelected', function () {
            var emptySalesOrders = ['', undefined];

            if (emptySalesOrders.indexOf($scope.salesOrderItemSelected) !== -1) {
                $scope.hasSalesOrderItems = false;
            }
            else {
                $scope.hasSalesOrderItems = true;
                var distributionPlanLineItems = $scope.salesOrderItemSelected.information.distributionplanlineitem_set;
                if (distributionPlanLineItems && distributionPlanLineItems.length > 0) {
                    var itemCounter = 0;
                    var quantityLeft = parseInt($scope.salesOrderItemSelected.quantity);

                    distributionPlanLineItems.forEach(function (planLineItemID) {
                        DistributionPlanLineItemService.getLineItemDetails(planLineItemID).then(function (result) {
                            result.quantity = quantityLeft.toString();
                            result.target_quantity = result.targeted_quantity;
                            $scope.distributionPlanItems.push(result);
                            if (itemCounter === 0) {
                                DistributionPlanNodeService.getPlanNodeDetails(result.distribution_plan_node).then(function (nodeInformation) {
                                    $scope.planId = nodeInformation.distribution_plan;
                                });
                            }
                            quantityLeft = quantityLeft - parseInt(result.targeted_quantity);
                            itemCounter++;
                            $scope.salesOrderItemSelected.quantityLeft = quantityLeft.toString();
                        });
                    });


                }
                else {
                    $scope.distributionPlanItems = [];
                }

                var currentDistributionPlanItems = $scope.distributionPlanItems;

                if (currentDistributionPlanItems && currentDistributionPlanItems.length > 0) {
                    $scope.hasDistributionPlanItems = true;
                }
            }
        });

    });