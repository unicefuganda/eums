'use strict';

angular.module('EndUserResponses', ['eums.config', 'DistributionPlan', 'Programme', 'Consignee', 'PurchaseOrder', 'Item', 'DistributionPlanNode', 'SalesOrderItem'])
    .controller('EndUserResponsesController',function ($scope, $q, $location, DistributionPlanService, ProgrammeService, ConsigneeService, PurchaseOrderService, ItemService, DistributionPlanNodeService, SalesOrderItemService) {
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
            ProgrammeService.all().then(function (result) {
                var programmes = result;
                $scope.programmes = $scope.programmes.concat(programmes);
            });

            ConsigneeService.fetchConsignees().then(function (consignees) {
                $scope.consignees = $scope.consignees.concat(consignees);
            });

            PurchaseOrderService.getPurchaseOrders().then(function (purchaseOrders) {
                $scope.purchaseOrders = $scope.purchaseOrders.concat(purchaseOrders);
            });

            ItemService.all().then(function (items) {
                $scope.items = $scope.items.concat(items);
            });

            getAllEndUserResponses().then(function (allResponses){
                $scope.allResponses = allResponses;
                $scope.programmeResponses = allResponses;
                $scope.consigneeResponses = allResponses;
                $scope.purchaseOrderResponses = allResponses;
                $scope.itemResponses = allResponses;
            });
        };

        function getAllEndUserResponses(){
            return DistributionPlanService.getAllEndUserResponses().then(function (allResponses){
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
                                            response.purchase_order = poItem.purchase_order;
                                        })
                                    );
                                }
                            })
                        );
                    }
                });

                return $q.all(nodePromises).then( function(){
                    return $q.all(poItemPromises).then( function(){
                        return allResponses.data;
                    });
                });

            });
        }

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
                    return $.isEmptyObject(end_user_response.purchase_order) ? false : parseInt(end_user_response.purchase_order.order_number) === parseInt($scope.selectedPurchaseOrder.order_number);
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

        $scope.clickPurchaseOrder = function (selectedPurchaseOrder) {
            $location.path('/delivery-report/new/' + selectedPurchaseOrder.id);
        };
    })
    .directive('customPopover', function () {
        return {
            restrict: 'A',
            link: function (scope, el, attrs) {
                $(el).popover({
                    trigger: 'hover',
                    html: true,
                    content: attrs.popoverHtml
                });
            }
        };
    });