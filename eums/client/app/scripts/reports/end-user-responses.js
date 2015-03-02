'use strict';

angular.module('EndUserResponses', ['eums.config', 'DistributionPlan', 'Programme', 'Consignee', 'PurchaseOrder', 'Item', 'DistributionPlanNode', 'SalesOrderItem'])
    .controller('EndUserResponsesController',function ($scope, $q, DistributionPlanService, ProgrammeService, ConsigneeService, PurchaseOrderService, ItemService, DistributionPlanNodeService, SalesOrderItemService) {
        $scope.allResponses = [];
        $scope.filteredResponses = [];
        $scope.programmeResponses = [];
        $scope.consigneeResponses = [];
        $scope.purchaseOrderResponses = [];
        $scope.itemResponses = [];
        $scope.programmes = [{id: 0, name: 'All Outcomes'}];
        $scope.consignees = [{id: 0, name: 'All Implementing Partners'}];
        $scope.purchaseOrders = [{id: 0, order_number: 'All Purchase Orders'}];
        $scope.items = [{id: 0, description: 'All Items'}];

        $scope.initialize = function () {
            ProgrammeService.fetchProgrammes().then(function (result) {
                var programmes = result.data;
                $scope.programmes = $scope.programmes.concat(programmes);
            });

            ConsigneeService.fetchConsignees().then(function (consignees) {
                $scope.consignees = $scope.consignees.concat(consignees);
            });

            PurchaseOrderService.getPurchaseOrders().then(function (purchaseOrders) {
                $scope.purchaseOrders = $scope.purchaseOrders.concat(purchaseOrders);
            });

            ItemService.fetchItems().then(function (items) {
                $scope.items = $scope.items.concat(items);
            });

            DistributionPlanService.getAllEndUserResponses().then(function (allResponses){
                var nodePromises = [];
                var poItemPromises = [];

                allResponses.data.forEach(function (response) {
                    if(response.node){
                        nodePromises.push(
                            DistributionPlanNodeService.getPlanNodeDetails(response.node).then(function (planNode) {
                                response.contact_person = planNode.contact_person;

                                if(planNode.lineItems.length > 0){
                                    var sales_order_item_id = planNode.lineItems[0].item;
                                    poItemPromises.push(
                                        SalesOrderItemService.getPOItemforSOItem(sales_order_item_id).then(function (poItem){
                                            response.purchase_order = poItem.length > 0 ? poItem.purchase_order.order_number : '';
                                        })
                                    );
                                }
                            })
                        );
                    }
                });

                $q.all(nodePromises).then( function(){
                    $q.all(poItemPromises).then( function(){
                        $scope.allResponses = allResponses.data;
                        $scope.programmeResponses = $scope.allResponses;
                        $scope.consigneeResponses = $scope.allResponses;
                        $scope.purchaseOrderResponses = $scope.allResponses;
                        $scope.itemResponses = $scope.allResponses;
                    });
                });

            });
        };

        function setFilteredResponses(){
            $scope.filteredResponses = _.intersection($scope.programmeResponses, $scope.consigneeResponses, $scope.purchaseOrderResponses, $scope.itemResponses);
        }

        $scope.selectProgramme = function () {
            $scope.programmeResponses = $scope.allResponses;
            if (Boolean($scope.selectedProgramme.id)) {
                $scope.programmeResponses = $scope.allResponses.filter(function (end_user_response) {
                    return parseInt(end_user_response.programme.id) === parseInt($scope.selectedProgramme.id);
                });
            }
            setFilteredResponses();
        };

        $scope.selectConsignee = function () {
            $scope.consigneeResponses = $scope.allResponses;
            if (Boolean($scope.selectedConsignee.id)) {
                $scope.consigneeResponses = $scope.allResponses.filter(function (end_user_response) {
                    return parseInt(end_user_response.consignee.id) === parseInt($scope.selectedConsignee.id);
                });
            }
            setFilteredResponses();
        };

        $scope.selectPurchaseOrder = function () {
            $scope.purchaseOrderResponses = $scope.allResponses;
            if (Boolean($scope.selectedPurchaseOrder.id)) {
                $scope.purchaseOrderResponses = $scope.allResponses.filter(function (end_user_response) {
                    return parseInt(end_user_response.purchase_order) === parseInt($scope.selectedPurchaseOrder.order_number);
                });
            }
            setFilteredResponses();
        };

        $scope.selectItem = function () {
            $scope.itemResponses = $scope.allResponses;
            if (Boolean($scope.selectedItem.id)) {
                $scope.itemResponses = $scope.allResponses.filter(function (end_user_response) {
                    return end_user_response.item === $scope.selectedItem.description;
                });
            }
            setFilteredResponses();
        };
    });