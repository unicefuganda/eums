'use strict';


angular.module('DeliveryReports', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'SalesOrder', 'PurchaseOrder', 'User', 'Directives'])
    .controller('DeliveryReportsController', function ($scope, $location, ProgrammeService, SalesOrderService, PurchaseOrderService, UserService, $sorter) {

        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.salesOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.pageTitle = 'Reported By IP';
        $scope.searchPromptText = 'Search by PO number, date or programme';
        $scope.documentColumnTitle = 'Purchase Order Number';
        $scope.descriptionColumnTitle = 'Programme';
        $scope.descriptionColumnOrder = 'programme';

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('order_number');
            this.sort.descending = false;

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
            $location.path('/delivery-report/new/' + selectedSalesOrder.id);
        };
    });

