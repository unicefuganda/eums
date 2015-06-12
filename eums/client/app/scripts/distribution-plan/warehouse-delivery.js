'use strict';


angular.module('WarehouseDelivery', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'SalesOrder', 'PurchaseOrder', 'User', 'Directives'])
    .controller('WarehouseDeliveryController', function ($scope, $location, DistributionPlanService, ProgrammeService, SalesOrderService, PurchaseOrderService, UserService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.salesOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.pageTitle = 'Delivery';
        $scope.searchPromptText = 'Search by document number, date or description';
        $scope.documentColumnTitle = 'Waybill #';
        $scope.descriptionColumnTitle = 'Programme Name';
        $scope.descriptionColumnOrder = 'description';

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('order_number');
            this.sort.descending = false;

            SalesOrderService.forWarehouseDelivery().then(function (salesOrders) {
                $scope.salesOrders = salesOrders.sort();
                angular.element('#loading').modal('hide');
            });
        };

        $scope.sortArrowClass = function (criteria) {
            var output = '';

            if (this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if (this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.selectSalesOrder = function (selectedSalesOrder) {
            if ($location.path() === '/delivery-reports') {
                $location.path('/delivery-report/new/' + selectedSalesOrder.id);
            } else {
                $location.path('/distribution-plan/new/' + selectedSalesOrder.id);
            }
        };

        $scope.showDistributionPlan = function (planId) {
            $scope.planId = planId;
        };
    });

