'use strict';


angular.module('WarehouseDelivery', ['ngTable', 'siTable', 'ReleaseOrder', 'SortBy', 'SystemSettingsService', 'Contact', 'ExportDeliveries', 'ngToast', 'Loader'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('WarehouseDeliveryController', function ($scope, $location, ReleaseOrderService, SystemSettingsService, SortByService, $sorter, ExportDeliveriesService, ngToast, LoaderService, $timeout) {
        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';
        $scope.searchFields = ['waybill', 'deliveryDate'];//, 'programme'];

        $scope.releaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;
        $scope.sortTerm = {field: 'trackedDate', orderIndex: 0};

        $scope.documentColumnTitle = 'Waybill #';
        $scope.dateColumnTitle = 'Date Shipped';
        $scope.trackedDateColumnTitle = 'Tracked Date';
        $scope.descriptionColumnTitle = 'Outcome Name';

        $scope.autoTrack = SystemSettingsService.isAutoTrack();


        function loadReleaseOrder(options) {
            LoaderService.showLoader();


            options = angular.extend({'paginate': 'true'}, options);

            ReleaseOrderService.all(undefined, options).then(function (response) {
                $scope.releaseOrders = response.results.sort();
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;

                if (options) {
                    if (options.from) {
                        $scope.fromDate = moment(Date.parse(options.from)).format('DD-MMM-YYYY');
                        initializing = true;
                    }

                    if (options.to) {
                        $scope.toDate = moment(Date.parse(options.to)).format('DD-MMM-YYYY');
                        initializing = true;
                    }
                }
                LoaderService.hideLoader();
            }).catch(function () {
                ngToast.create({content: 'Failed to load release orders', class: 'danger'});
            });

        }

        $scope.initialize = function (urlArgs) {
            this.sortBy('trackedDate');
            this.sort.descending = false;

            loadReleaseOrder(urlArgs);
        };

        $scope.goToPage = function (page) {
            loadReleaseOrder(angular.extend({'page': page}, changedFilters()));
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

        $scope.sortedBy = function (sortField) {
            var sort = SortByService.sortedBy($scope.sortTerm, sortField);
            this.sortBy(sort.field);
            this.sort.descending = sort.des;
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
            if (initializing) {
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

