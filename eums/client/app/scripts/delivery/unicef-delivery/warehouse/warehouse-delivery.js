'use strict';

angular.module('WarehouseDelivery', ['ngTable', 'siTable', 'ReleaseOrder', 'SortBy', 'SystemSettingsService', 'Contact',
        'ExportDeliveries', 'ngToast', 'Loader', 'SysUtils'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('WarehouseDeliveryController', function ($scope, $location, ReleaseOrderService, SortArrowService,
                                                         SortService, SystemSettingsService, SortByService, ExportDeliveriesService,
                                                         ngToast, LoaderService, SysUtilsService, $timeout) {
        var SUPPORTED_FIELD = ['orderNumber', 'deliveryDate', 'trackedDate'];
        var timer;
        var initializing = true;

        $scope.searchFields = ['waybill', 'deliveryDate']; //, 'programme'];
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.releaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;
        $scope.directiveValues = {};

        $scope.pagination = {page: 1};
        $scope.searchTerm = {};
        $scope.sortTerm = {field: 'trackedDate', order: 'desc'};

        $scope.documentColumnTitle = 'Waybill #';
        $scope.dateColumnTitle = 'Date Shipped';
        $scope.trackedDateColumnTitle = 'Tracked Date';
        $scope.descriptionColumnTitle = 'Outcome Name';

        $scope.$watchCollection('searchTerm', function (oldSearchTerm, newSearchTerm) {
            $scope.pagination.page = 1;
            if (initializing) {
                loadReleaseOrder();
                initializing = false;
            } else {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }

                if (oldSearchTerm.itemDescription != newSearchTerm.itemDescription ||
                    oldSearchTerm.waybill != newSearchTerm.waybill) {
                    startTimer();
                } else {
                    loadReleaseOrder();
                }
            }
        });

        $scope.goToPage = function (page) {
            $scope.pagination.page = page;
            loadReleaseOrder();
        };

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm);
        };

        $scope.sortBy = function (sortField) {
            if (_.include(SUPPORTED_FIELD, sortField)) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                $scope.goToPage(1);
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

        function startTimer() {
            timer = $timeout(function () {
                loadReleaseOrder()
            }, 2000);
        }

        function loadReleaseOrder() {
            LoaderService.showLoader();
            initAutoTrack();

            var allFilters = angular.extend({
                'paginate': 'true',
                'page': $scope.pagination.page
            }, getSearchTerms(), $scope.sortTerm);

            ReleaseOrderService.all(undefined, allFilters).then(function (response) {
                $scope.releaseOrders = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
            }).catch(function () {
                ngToast.create({content: 'Failed to load release orders', class: 'danger'});
            }).finally(function () {
                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }

        function getSearchTerms() {
            var filters = _($scope.searchTerm).omit(_.isUndefined).omit(_.isNull).value();
            if (filters.fromDate)
                filters.fromDate = SysUtilsService.formatDateToYMD(filters.fromDate);
            if (filters.toDate)
                filters.toDate = SysUtilsService.formatDateToYMD(filters.toDate);
            return filters;
        }

        function initAutoTrack() {
            SystemSettingsService.getSettings().then(function (data) {
                $scope.autoTrack = data.auto_track;
            });
        }
    });
