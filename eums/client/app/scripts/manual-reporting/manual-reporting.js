'use strict';

angular.module('ManualReporting', ['ngTable', 'ngToast', 'siTable', 'eums.ip', 'SortBy', 'Loader', 'SysUtils', 'PurchaseOrder', 'ReleaseOrder'])
    .controller('ManualReportingController', function ($sorter, $scope, $q, $timeout, $location, SortByService, PurchaseOrderService,
                                                       LoaderService, ReleaseOrderService, SortArrowService, SortService,
                                                       SysUtilsService, ngToast) {
        var SUPPORTED_FIELD = ['orderNumber', 'deliveryDate', 'trackedDate'];
        var timer;
        var initializing = true;

        $scope.searchFields = ['orderNumber', 'date'];
        $scope.purchaseOrders = [];
        $scope.releaseOrders = [];
        $scope.currentDocumentType = 'PO';

        $scope.pagination = {page: 1};
        $scope.searchTerm = {};
        $scope.sortTerm = {field: 'orderNumber', order: 'desc'}; //$scope.sortTerm = {field: 'order_number', orderIndex: 0};

        $scope.$watchCollection('searchTerm', function (oldSearchTerm, newSearchTerm) {
            $scope.pagination.page = 1;
            if (initializing) {
                $scope.goToPage(1);
                initializing = false;
            } else {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }

                if (oldSearchTerm.query != newSearchTerm.query) {
                    startTimer();
                } else {
                    $scope.goToPage(1);
                }
            }
        });

        $scope.$watch('currentDocumentType', function () {
            if ($scope.currentDocumentType === 'PO') {
                $scope.placeHolderText = 'Search by purchase order number';
            }
            if ($scope.currentDocumentType === 'RO') {
                $scope.placeHolderText = 'Search by waybill number';
            }
            $scope.goToPage(1);
        });

        $scope.goToPage = function (page) {
            $scope.pagination.page = page;
            $scope.currentDocumentType === 'PO' ? loadPurchaseOrders() : loadReleaseOrder();
        };

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm);
        };

        $scope.sortedBy = function (sortField) {
            if (_.include(SUPPORTED_FIELD, sortField)) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                $scope.goToPage(1);
            }
        };

        $scope.toggleDocumentType = function (type) {
            $scope.currentDocumentType = type;
        };

        $scope.selectDocument = function (document) {
            if ($scope.currentDocumentType === 'PO') {
                $location.path('/field-verification-details/purchase-order/' + document.id);
            } else {
                $location.path('/field-verification-details/waybill/' + document.id);
            }
        };

        function startTimer() {
            timer = $timeout(function () {
                $scope.currentDocumentType === 'PO' ? loadPurchaseOrders() : loadReleaseOrder();
            }, 2000);
        }

        function loadPurchaseOrders() {
            LoaderService.showLoader();
            var allFilters = angular.extend({
                'paginate': 'true',
                'page': $scope.pagination.page
            }, getSearchTerms(), $scope.sortTerm);

            console.log(allFilters);
            PurchaseOrderService.forDirectDelivery(undefined, allFilters).then(function (response) {
                $scope.purchaseOrders = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
                $scope.documents = $scope.purchaseOrders;

                // todo: remove below line maybe
                $scope.purchaseOrders.forEach(function (po) {
                    po.programme = po.programmeName;
                });
            }, function (error) {
                if (error.status === 500) {
                    ngToast.create({content: 'Failed to load purchase orders', class: 'danger'});
                }
            }).finally(function () {
                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }

        function loadReleaseOrder() {
            LoaderService.showLoader();
            var allFilters = angular.extend({
                'paginate': 'true',
                'page': $scope.pagination.page
            }, getSearchTerms(), $scope.sortTerm);

            console.log(allFilters);
            ReleaseOrderService.all(undefined, allFilters).then(function (response) {
                $scope.releaseOrders = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
                $scope.documents = $scope.releaseOrders;

                $scope.releaseOrders.forEach(function (ro) {
                    ro.date = ro.deliveryDate;
                    ro.orderNumber = ro.waybill;
                });
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
            if (filters.query)
                rename(filters, 'query', $scope.currentDocumentType === 'PO' ? 'purchaseOrder' : 'waybill')
            return filters;
        }

        function rename(obj, oldName, newName) {
            if (!obj.hasOwnProperty(oldName)) {
                return false;
            }

            obj[newName] = obj[oldName];
            delete obj[oldName];
            return true;
        }
    });

//PurchaseOrderService.all().then(function (responses) {
//    purchaseOrders = responses;
//    responses.forEach(function (response) {
//        response.programme = response.programmeName;
//    });
//});

//ReleaseOrderService.all().then(function (responses) {
//    responses.forEach(function (response) {
//        response.date = response.deliveryDate;
//        response.orderNumber = response.waybill;
//    });
//    $scope.waybills = responses;
//})

//var sort = SortByService.sortedBy($scope.sortTerm, sortField);
//this.sortBy(sort.field);
//this.sort.descending = sort.des;
