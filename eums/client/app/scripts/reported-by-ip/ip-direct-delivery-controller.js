'use strict';

angular.module('IPDirectDelivery', ['ngTable', 'siTable', 'PurchaseOrder', 'User', 'Directives', 'DatePicker'])
    .controller('IPDirectDeliveryController', function ($scope, $location, PurchaseOrderService, UserService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.purchaseOrders = [];
        $scope.searchFields = ['orderNumber', 'date'];

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('orderNumber');
            this.sort.descending = false;

            UserService.getCurrentUser().then(function (user) {
                PurchaseOrderService.forUser(user).then(function (purchaseOrders) {
                    purchaseOrders.forEach(function (purchaseOrder) {
                        if(purchaseOrder.hasPlan) {
                            $scope.purchaseOrders.push(purchaseOrder);
                        }
                    });
                    angular.element('#loading').modal('hide');
                });
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