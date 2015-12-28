'use strict';


angular.module('WarehouseDelivery', ['ngTable', 'siTable', 'ReleaseOrder', 'SortBy', 'SystemSettingsService', 'Contact', 'ExportDeliveries', 'ngToast', 'Loader'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('WarehouseDeliveryController', function ($scope, $location, ReleaseOrderService, SortArrowService, SortService, SystemSettingsService, SortByService, ExportDeliveriesService, ngToast, LoaderService, $timeout) {
        var SUPPORTED_FIELD = ['orderNumber', 'deliveryDate', 'trackedDate'];
        $scope.errorMessage = '';
        $scope.planId = '';
        $scope.searchFields = ['waybill', 'deliveryDate'];//, 'programme'];

        $scope.releaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;
        $scope.sortTerm = {field: 'trackedDate', order: 'desc'};

        $scope.documentColumnTitle = 'Waybill #';
        $scope.dateColumnTitle = 'Date Shipped';
        $scope.trackedDateColumnTitle = 'Tracked Date';
        $scope.descriptionColumnTitle = 'Outcome Name';

        function loadReleaseOrder(options) {
            LoaderService.showLoader();

            initAutoTrack();
            options = angular.extend({'paginate': 'true'}, options, $scope.sortTerm);

            ReleaseOrderService.all(undefined, options).then(function (response) {
                $scope.releaseOrders = response.results;
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
            loadReleaseOrder(urlArgs);
        };

        $scope.goToPage = function (page) {

            loadReleaseOrder(angular.extend({'page': page}, changedFilters()));
        };

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm);
        };

        $scope.sortBy = function (sortField) {
            if (SUPPORTED_FIELD.indexOf(sortField) !== -1) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                $scope.goToPage(1);
                $scope.currentPage = 1;
                loadReleaseOrder()
            }
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

        function initAutoTrack() {
            SystemSettingsService.getSettings().then(function (data) {
                $scope.autoTrack = data.auto_track;
            });
        }
    })
;

