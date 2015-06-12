'use strict';


angular.module('WarehouseDelivery', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'SalesOrder', 'PurchaseOrder', 'User', 'Directives'])
    .controller('WarehouseDeliveryController', function ($scope, $location, DistributionPlanService, ProgrammeService, SalesOrderService, PurchaseOrderService, UserService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.salesOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.deliveryReportPage = $location.path() === '/delivery-reports';

        if ($scope.deliveryReportPage) {
            $scope.pageTitle = 'Reported By IP';
            $scope.searchPromptText = 'Search by PO number, date or programme';
            $scope.documentColumnTitle = 'Purchase Order Number';
            $scope.descriptionColumnTitle = 'Programme';
            $scope.descriptionColumnOrder = 'programme';
        }
        else {
            $scope.pageTitle = 'Sales Orders';
            $scope.searchPromptText = 'Search by document number, date or description';
            $scope.documentColumnTitle = 'Document Number';
            $scope.descriptionColumnTitle = 'Description';
            $scope.descriptionColumnOrder = 'description';
        }

        function reduceSalesOrder(salesOrders) {
            return _.remove(salesOrders, function (salesOrder, index) {
                return index > 80;
            });
        }

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('order_number');
            this.sort.descending = false;

            if ($scope.deliveryReportPage) {
                UserService.getCurrentUser().then(function (user) {
                    if (user.consignee_id) {
                        PurchaseOrderService.getConsigneePurchaseOrders(user.consignee_id).then(function (purchaseOrders) {
                            $scope.salesOrders = purchaseOrders.sort();
                            angular.element('#loading').modal('hide');
                        });
                    }
                    else {
                        PurchaseOrderService.all().then(function (purchaseOrders) {
                            $scope.salesOrders = purchaseOrders.sort();
                            angular.element('#loading').modal('hide');
                        });
                    }
                });
            }
            else {
                SalesOrderService.forWarehouseDelivery().then(function (salesOrders) {
                    var sortedSalesOrder = salesOrders.sort();
                    $scope.salesOrders = $location.path() === '/warehouse-delivery' ? sortedSalesOrder : reduceSalesOrder(sortedSalesOrder);
                    angular.element('#loading').modal('hide');
                });
            }
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

