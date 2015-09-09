'use strict';


angular.module('WarehouseDelivery', ['ngTable', 'siTable', 'ReleaseOrder', 'Contact', 'ExportDeliveries', 'ngToast', 'Loader'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('WarehouseDeliveryController', function ($scope, $location, ReleaseOrderService, $sorter, ExportDeliveriesService, ngToast, LoaderService) {
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

        $scope.initialize = function (urlArgs) {
            LoaderService.showLoader();
            this.sortBy('orderNumber');
            this.sort.descending = false;

            ReleaseOrderService.all(undefined, urlArgs).then(function (releaseOrders) {
                $scope.releaseOrders = releaseOrders.sort();
                LoaderService.hideLoader();
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
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        };

        $scope.$watch('[fromDate,toDate,query]', function () {
            var hasDateRange = ($scope.fromDate && $scope.toDate);
            if ($scope.query || hasDateRange) {
                var urlArgs;
                urlArgs = !hasDateRange ?
                {query: $scope.query} :
                    !$scope.query ?
                    {from: formatDate($scope.fromDate), to: formatDate($scope.toDate)} :
                    {from: formatDate($scope.fromDate), to: formatDate($scope.toDate), query: $scope.query};
                $scope.initialize(urlArgs);
            }
        }, true);

        function formatDate(date) {
            return moment(date).format('YYYY-MM-DD')
        }
    });

