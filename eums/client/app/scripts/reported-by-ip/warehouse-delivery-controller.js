'use strict';

angular.module('IPWarehouseDelivery', ['ngTable', 'siTable', 'ReleaseOrder', 'User', 'Directives', 'DatePicker'])
    .controller('IPWarehouseDeliveryController', function ($scope, $location, ReleaseOrderService, UserService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.releaseOrders = [];
        $scope.searchFields = ['waybill', 'deliveryDate'];

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('orderNumber');
            this.sort.descending = false;

            UserService.getCurrentUser().then(function (user) {
                ReleaseOrderService.forUser(user).then(function (releaseOrders) {
                    $scope.releaseOrders = releaseOrders.sort();
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

        $scope.selectReleaseOrder = function (selectedReleaseOrder) {
            $location.path('/ip-warehouse-delivery/new/' + selectedReleaseOrder.id);
        };
    });