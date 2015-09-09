'use strict';


angular.module('WarehouseDelivery', ['ngTable', 'siTable', 'ReleaseOrder', 'Contact', 'ExportDeliveries', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('WarehouseDeliveryController', function ($scope, $location, ReleaseOrderService, $sorter, ExportDeliveriesService, ngToast) {
        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';
        $scope.searchFields = ['waybill', 'deliveryDate'];//, 'programme'];

        $scope.releaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.documentColumnTitle = 'Waybill #';
        $scope.dateColumnTitle = 'Date Shipped';
        $scope.descriptionColumnTitle = 'Programme Name';

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('orderNumber');
            this.sort.descending = false;

            ReleaseOrderService.all().then(function (releaseOrders) {
                $scope.releaseOrders = releaseOrders.sort();
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

        $scope.selectReleaseOrder = function (selectedReleaseOrderId) {
            $location.path('/warehouse-delivery/new/' + selectedReleaseOrderId);
        };

        $scope.exportToCSV = function () {
            ExportDeliveriesService.export().then(function (response) {
                ngToast.create({content: response.data.message, class: 'info'});
            });
        }
    });

