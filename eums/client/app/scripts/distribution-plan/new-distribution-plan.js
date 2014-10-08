'use strict';

angular.module('NewDistributionPlan', ['DistributionPlan', 'eums.config', 'ngTable', 'siTable', 'Programme', 'SalesOrderItem'])
    .controller('NewDistributionPlanController', function ($scope, DistributionPlanParameters, SalesOrderItemService) {

        $scope.salesOrderItems = [];

        $scope.initialize = function () {
            $scope.salesOrderItemSelected = undefined;
            $scope.hasSalesOrderItems = false;

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

        $scope.$watch('salesOrderItemSelected', function (){

            var emptySalesOrders = ['', undefined];

            if(emptySalesOrders.indexOf($scope.salesOrderItemSelected) !== -1)
            {
                $scope.hasSalesOrderItems = false;
            }
            else{
                $scope.hasSalesOrderItems = true;
            }
        });

    });