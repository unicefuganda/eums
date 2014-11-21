'use strict';

angular.module('Responses', ['eums.config', 'SalesOrder', 'SalesOrderItem', 'treeGrid', 'localytics.directives'])
    .controller('ResponsesController',function ($scope, ResponsesService, SalesOrderService, SalesOrderItemService) {
        $scope.responses = [];
        $scope.salesOrders = [];
        $scope.salesOrderItems = [];
        $scope.salesOrderItemConsignees = [];

        $scope.initialize = function () {
            SalesOrderService.getSalesOrders().then(function (salesOrders) {
                var sortedSalesOrder = salesOrders.sort();
                $scope.salesOrders = sortedSalesOrder;
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

        $scope.selectSalesOrder = function () {
            $scope.responses = [];
            $scope.salesOrderItems = [];
            $scope.salesOrderItemConsignees = [];

            if ($scope.selectedSalesOrder) {
                $scope.selectedSalesOrder.salesorderitem_set.forEach(function (salesOrderItem) {
                    SalesOrderItemService.getSalesOrderItem(salesOrderItem).then(function (result) {
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

        $scope.selectSalesOrderItem = function () {
            $scope.responses = [];
            $scope.salesOrderItemConsignees = [];

            if ($scope.selectedSalesOrderItem) {
                SalesOrderItemService.getSalesOrderItem($scope.selectedSalesOrderItem.information.id).then(function (salesOrderItem) {
                    SalesOrderItemService.getTopLevelDistributionPlanNodes(salesOrderItem).then(function (topLevelNodes) {
                        $scope.salesOrderItemConsignees = topLevelNodes;
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

        $scope.selectSalesOrderItemConsignee = function () {
            $scope.responses = [];

            if ($scope.selectedSalesOrderItemConsignee) {
                ResponsesService.fetchResponses($scope.selectedSalesOrderItemConsignee.consignee, $scope.selectedSalesOrderItem.information.id).then(function (responses) {
                    $scope.responses = formatResponses([responses]);
                });
            }
        };

    }).factory('ResponsesService',function ($http, EumsConfig) {
        return {
            fetchResponses: function (consigneeId, salesOrderItemId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_RESPONSES + consigneeId + '/sales_order_item/' + salesOrderItemId).then(function (response) {
                    return response.data;
                });
            }
        };
    });



