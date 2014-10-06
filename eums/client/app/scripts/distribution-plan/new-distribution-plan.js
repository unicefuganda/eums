'use strict';

angular.module('NewDistributionPlan', ['DistributionPlan', 'eums.config', 'ngTable', 'siTable', 'Programme', 'SalesOrderItem'])
    .controller('NewDistributionPlanController', function ($scope, DistributionPlanParameters, ProgrammeService, SalesOrderItemService, $location) {
        $scope.salesOrders = [];
        $scope.selectedSalesOrders = [];
        $scope.programmeName = '';
        $scope.focalPerson = '';
        $scope.date = '';
        $scope.programmeSelected = {name: ''};
        $scope.consigneeSelected = {name: ''};

        function retrieveScopeVariables() {
            $scope.selectedSalesOrders = DistributionPlanParameters.retrieveVariable('selectedSalesOrders');
            $scope.programmeName = DistributionPlanParameters.retrieveVariable('programmeName');
            $scope.date = DistributionPlanParameters.retrieveVariable('date');
            $scope.programmeSelected = DistributionPlanParameters.retrieveVariable('programmeSelected');
            $scope.consigneeSelected = DistributionPlanParameters.retrieveVariable('consigneeSelected');
        }

        $scope.initialize = function () {

            $scope.salesOrders = DistributionPlanParameters.retrieveVariable('salesOrders');

            if (DistributionPlanParameters.retrieveVariable('isProceeding')) {
                retrieveScopeVariables();
                var salesOrderItems = [];

                $scope.selectedSalesOrders.forEach(function (selectedOrder) {
                    var orderNumber = selectedOrder.order_number;
                    selectedOrder.salesorderitem_set.forEach(function (salesOrderItem) {
                        var salesOrderItemInformation = [];
                        SalesOrderItemService.getSalesOrderItem(salesOrderItem).then(function (result) {
                            salesOrderItemInformation = result;
                            salesOrderItems.push({salesOrder: orderNumber, item: salesOrderItemInformation});
                        });
                    });
                });

                $scope.salesOrderItems = salesOrderItems;
            }
            else {

                ProgrammeService.fetchProgrammes().then(function (response) {
                    $scope.programmes = response.data;
                });
            }
        };

        $scope.setSupplyPlan = function () {

        };

        $scope.setTracked = function () {

        };

        $scope.setRequired = function () {

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

        $scope.selectItems = function () {
            DistributionPlanParameters.saveVariable('selectedSalesOrders', $scope.selectedSalesOrders);
            DistributionPlanParameters.saveVariable('isProceeding', true);
            DistributionPlanParameters.saveVariable('programmeName', $scope.programmeName);
            DistributionPlanParameters.saveVariable('date', $scope.date);
            DistributionPlanParameters.saveVariable('programmeSelected', $scope.programmeSelected);
            DistributionPlanParameters.saveVariable('consigneeSelected', $scope.consigneeSelected);
            $location.path('/distribution-plan/proceed/');
        };
    });