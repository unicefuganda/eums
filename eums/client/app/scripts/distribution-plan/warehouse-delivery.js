'use strict';


angular.module('WarehouseDelivery', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'ReleaseOrder'])
    .controller('WarehouseDeliveryController', function ($scope, $location, ReleaseOrderService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.salesOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.warehouseDelivery = true;
        $scope.documentColumnTitle = 'Waybill #';
        $scope.dateColumnTitle = 'Date Delivered';
        $scope.descriptionColumnTitle = 'Programme Name';
        $scope.descriptionColumnOrder = 'description';

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('order_number');
            this.sort.descending = false;

            ReleaseOrderService.all().then(function (releaseOrders) {
                $scope.salesOrders = releaseOrders.sort();
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
            $location.path('/distribution-plan/new/' + selectedSalesOrder.id);
        };
    });

