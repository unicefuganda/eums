'use strict';

angular.module('ReportedByIP', ['ngTable', 'siTable', 'PurchaseOrder', 'User', 'Directives'])
    .controller('IPPurchaseOrdersController', function ($scope, $location, PurchaseOrderService, UserService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.purchaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('order_number');
            this.sort.descending = false;

            UserService.getCurrentUser().then(function (user) {
                if (user.consignee_id) {
                    PurchaseOrderService.getConsigneePurchaseOrders(user.consignee_id).then(function (purchaseOrders) {
                        $scope.purchaseOrders = purchaseOrders.sort();
                        angular.element('#loading').modal('hide');
                    });
                }
                else {
                    PurchaseOrderService.all(['programme']).then(function (purchaseOrders) {
                        $scope.purchaseOrders = purchaseOrders.sort();
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

        $scope.selectPurchaseOrder = function (selectedPurchaseOrder) {
            $location.path('/delivery-report/new/' + selectedPurchaseOrder.id);
        };
    });

