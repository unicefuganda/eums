'use strict';


angular.module('WarehouseDelivery', ['ngTable', 'siTable', 'ReleaseOrder', 'Contact', 'ExportDeliveries', 'ngToast', 'Loader'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('WarehouseDeliveryController', function ($scope, $location, ReleaseOrderService, $sorter, ExportDeliveriesService, ngToast, LoaderService, $timeout) {
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
                if(urlArgs) {
                    if(urlArgs.from) {
                        $scope.fromDate = moment(Date.parse(urlArgs.from)).format('DD-MMM-YYYY');
                        initializing = true;
                    }

                    if(urlArgs.to) {
                        $scope.toDate = moment(Date.parse(urlArgs.to)).format('DD-MMM-YYYY');
                        initializing = true;
                    }
                }
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
            ExportDeliveriesService.export('warehouse').then(function (response) {
                ngToast.create({content: response.data.message, class: 'info'});
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        };

        var timer, initializing = true;

        $scope.$watch('[fromDate,toDate,query]', function () {
            if (initializing){
                initializing = false;
            }
            else {
                if (timer) {
                    $timeout.cancel(timer);
                }
                delaySearch();
            }
        }, true);

        function delaySearch() {
            timer = $timeout(function () {
                $scope.initialize(changedFilters());
            }, 2000);
        }

        function changedFilters() {
            var urlArgs = {};
            if ($scope.fromDate) {
                urlArgs.from = formatDate($scope.fromDate);
            }
            if ($scope.toDate) {
                urlArgs.to = formatDate($scope.toDate);
            }
            if ($scope.query) {
                urlArgs.query = $scope.query;
            }
            return urlArgs
        }

        function formatDate(date) {
            return moment(date).format('YYYY-MM-DD')
        }
    })
;

