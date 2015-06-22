'use strict';

angular.module('ReportedByIP', ['ngTable', 'siTable', 'PurchaseOrder', 'User', 'Directives'])
    .controller('IPPurchaseOrdersController', function ($scope, $location, PurchaseOrderService, UserService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.purchaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('order_number');
            this.sort.descending = false;

            UserService.getCurrentUser().then(function (user) {
                if (user.consignee_id) {
                    PurchaseOrderService.filter({consignee: user.consignee_id}).then(function (purchaseOrders) {
                        $scope.purchaseOrders = purchaseOrders.sort();
                        angular.element('#loading').modal('hide');
                    });
                }
                else {
                    PurchaseOrderService.all().then(function (purchaseOrders) {
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
            $location.path('/ip-delivery-report/new/' + selectedPurchaseOrder.id);
        };
    });

