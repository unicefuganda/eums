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
                        unit: result.item.unit.name,
                        information: result};

                    $scope.salesOrderItems.push(formattedSalesOrderItem);
                });
            });
        };

        $scope.addDistributionPlanItem = function () {
            var distributionPlanLineItem = {item: $scope.salesOrderItemSelected.information.item,
                quantity: $scope.salesOrderItemSelected.quantity, planned_distribution_date: '2014-10-10',
                targeted_quantity: 0, destination_location: '', mode_of_delivery: '',
                contact_phone_number: '', programme_focal: '', contact_person: ''};

            var currentDistributionPlanItems = $scope.distributionPlanItems;
            currentDistributionPlanItems.push(distributionPlanLineItem);

            if (currentDistributionPlanItems && currentDistributionPlanItems.length > 0) {
                $scope.hasDistributionPlanItems = true;
            }

            $scope.distributionPlanItems = currentDistributionPlanItems;
        };

        $scope.saveDistributionPlanItem = function () {
            if ($scope.planId === undefined) {
                DistributionPlanService.createPlan({programme: $scope.selectedSalesOrder.programme}).then(function (result) {
                    $scope.planId = result.id;
                });
            }
            $scope.distributionPlanItems.forEach(function (distributionPlanItem) {
                var nodeDetails = {consignee: distributionPlanItem.consignee.id,
                    distribution_plan: $scope.planId, tree_position: 'END_USER'};

                DistributionPlanNodeService.createNode(nodeDetails).then(function (response) {
                    var lineItemDetails = {item: distributionPlanItem.item.id, targeted_quantity: distributionPlanItem.targeted_quantity,
                        distribution_plan_node: response.id, planned_distribution_date: distributionPlanItem.planned_distribution_date,
                        programme_focal: distributionPlanItem.programme_focal.id, consignee: distributionPlanItem.consignee.id,
                        contact_person: distributionPlanItem.contact_person, contact_phone_number: distributionPlanItem.contact_phone_number,
                        destination_location: distributionPlanItem.destination_location, mode_of_delivery: distributionPlanItem.mode_of_delivery,
                        tracked: distributionPlanItem.tracked, remark: distributionPlanItem.remark};
                    DistributionPlanLineItemService.createLineItem(lineItemDetails);
                });

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

                    distributionPlanLineItems.forEach(function (planLineItemID) {
                        DistributionPlanLineItemService.getLineItemDetails(planLineItemID).then(function (result) {
                            $scope.distributionPlanItems.push(result);
                            if (itemCounter === 0) {
                                DistributionPlanNodeService.getPlanNodeDetails(result.distribution_plan_node).then(function (nodeInformation) {
                                    $scope.planId = nodeInformation.distribution_plan;
                                });
                            }
                            itemCounter++;
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