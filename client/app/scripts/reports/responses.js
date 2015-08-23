'use strict';

angular.module('Responses', ['eums.config', 'Programme', 'SalesOrder', 'SalesOrderItem', 'treeGrid', 'localytics.directives'])
    .controller('ResponsesController',function ($scope, ResponsesService, ProgrammeService, SalesOrderService, SalesOrderItemService) {
        $scope.responses = [];
        $scope.noResponses = '';
        $scope.programmes = [];
        $scope.salesOrders = [];
        $scope.salesOrderItems = [];
        $scope.salesOrderItemConsignees = [];

        $scope.initialize = function () {
            ProgrammeService.all().then(function (result) {
                $scope.programmes = result;
            });

            SalesOrderService.all().then(function (salesOrders) {
                $scope.salesOrders = salesOrders.sort();
            });
        };

        $scope.response_cols = [
            { field: 'productReceived', displayName: 'Received'},
            { field: 'dateOfReceipt', displayName: 'Date Received'},
            { field: 'amountReceived', displayName: 'Quantity Received'},
            { field: 'qualityOfProduct', displayName: 'Quality'},
            { field: 'satisfiedWithProduct', displayName: 'Satisfied'},
            { field: 'feedbackAboutDissatisfaction', displayName: 'Comments'}
        ];

        $scope.expanding_property = 'Consignee';

        $scope.selectProgramme = function () {
            $scope.responses = [];
            $scope.noResponses = '';
            $scope.salesOrders = [];
            $scope.salesOrderItems = [];
            $scope.salesOrderItemConsignees = [];
            $scope.selectedSalesOrder = {};
            $scope.selectedSalesOrderItem = {};
            $scope.selectedSalesOrderItemConsignee = {};

            if ($scope.selectedProgramme) {
                $scope.selectedProgramme.salesorder_set.forEach(function (salesOrderId) {
                    SalesOrderService.get(salesOrderId, ['programme']).then(function (salesOrder) {
                        $scope.salesOrders.push(salesOrder);
                    });
                });
            }
        };

        $scope.selectSalesOrder = function () {
            $scope.responses = [];
            $scope.noResponses = '';
            $scope.salesOrderItems = [];
            $scope.salesOrderItemConsignees = [];
            $scope.selectedSalesOrderItem = {};
            $scope.selectedSalesOrderItemConsignee = {};

            if ($scope.selectedSalesOrder) {
                $scope.selectedSalesOrder.salesorderitem_set.forEach(function (salesOrderItem) {
                    SalesOrderItemService.get(salesOrderItem).then(function (result) {
                        var formattedSalesOrderItem = {
                            id: result.item.id,
                            display: result.item.description,
                            materialCode: result.item.material_code,
                            quantity: result.quantity,
                            unit: result.item.unit.name,
                            information: result
                        };
                        $scope.salesOrderItems.push(formattedSalesOrderItem);
                    });
                });
            }
        };

        var formatResponses = function (responses) {
            var formattedResponses = [];

            responses.forEach(function (response) {
                if (response.node) {
                    var formattedResponse = {};
                    formattedResponse.Consignee = response.node;

                    angular.forEach(response.answers, function (response_answer, response_answer_key) {
                        formattedResponse[response_answer_key] = response_answer;
                    });

                    formattedResponse.children = formatResponses(response.children);
                    formattedResponses.push(formattedResponse);
                }
            });

            return formattedResponses;
        };

        $scope.selectSalesOrderItem = function () {
            $scope.responses = [];
            $scope.noResponses = '';
            $scope.salesOrderItemConsignees = [];
            $scope.selectedSalesOrderItemConsignee = {};

            if ($scope.selectedSalesOrderItem) {
                SalesOrderItemService.get($scope.selectedSalesOrderItem.information.id).then(function (salesOrderItem) {
                    SalesOrderItemService.getTopLevelDeliveryNodes(salesOrderItem).then(function (topLevelNodes) {
                        $scope.salesOrderItemConsignees = topLevelNodes;

                        if(topLevelNodes.length > 0){
                            topLevelNodes.forEach(function (consignee) {
                                ResponsesService.fetchResponses(consignee.consignee, $scope.selectedSalesOrderItem.information.id).then(function (responses) {
                                    if(!$.isEmptyObject(responses.answers)){
                                        $scope.responses.push(formatResponses([responses])[0]);
                                    }
                                    $scope.noResponses = $scope.responses ? '' : 'No responses found';
                                });
                            });
                        }
                        else{
                            $scope.noResponses = 'No responses found';
                        }
                    });
                });
            }
        };

        $scope.selectSalesOrderItemConsignee = function () {
            $scope.responses = [];
            $scope.noResponses = '';

            if ($scope.selectedSalesOrderItemConsignee) {
                ResponsesService.fetchResponses($scope.selectedSalesOrderItemConsignee.consignee, $scope.selectedSalesOrderItem.information.id).then(function (responses) {
                    if(!$.isEmptyObject(responses.answers)){
                        $scope.responses = formatResponses([responses]);
                    }
                    else{
                        $scope.noResponses = 'No responses found';
                    }
                });
            }
        };

    })
    .factory('ResponsesService',function ($http, EumsConfig) {
        return {
            fetchResponses: function (consigneeId, salesOrderItemId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_RESPONSES + consigneeId + '/sales_order_item/' + salesOrderItemId).then(function (response) {
                    return response.data;
                });
            }
        };
    });