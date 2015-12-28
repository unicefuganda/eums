'use strict';

angular.module('DirectDelivery', ['eums.config', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'SortBy', 'Directives', 'EumsFilters', 'Loader', 'ExportDeliveries', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('DirectDeliveryController', function ($scope, $location, ProgrammeService, SortByService, SortArrowService, SortService, PurchaseOrderService, UserService, $sorter, LoaderService, ExportDeliveriesService, ngToast, $timeout) {

        var rootPath = '/direct-delivery/new/';

        var SUPPORTED_FIELD = ['orderNumber', 'date', 'trackedDate', 'lastShipmentDate', 'poType', 'programmeName'];
        $scope.searchFields = ['orderNumber', 'lastShipmentDate'];
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.purchaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.documentColumnTitle = 'Purchase Order';
        $scope.dateColumnTitle = 'Date Created';
        $scope.trackedDateColumnTitle = 'Tracked Date';
        $scope.lastShipmentDateColumnTitle = 'Last Shipment Date';
        $scope.poTypeColumnTitle = 'PO Type';
        $scope.outcomeColumnTitle = 'Outcome';
        $scope.sortTerm = {field: 'trackedDate', order: 'desc'};

        function loadPurchaseOrders(options) {
            LoaderService.showLoader();
            options = angular.extend({'paginate': 'true'}, options, $scope.sortTerm);
            PurchaseOrderService.forDirectDelivery(undefined, options).then(function (response) {
                $scope.purchaseOrders = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
                LoaderService.hideLoader();
            }).catch(function () {
                ngToast.create({content: 'Failed to load purchase orders', class: 'danger'});
            });
        }

        $scope.initialize = function (urlArgs) {
            loadPurchaseOrders(urlArgs);
        };

        $scope.goToPage = function (page) {
            $scope.currentPage = page;
            loadPurchaseOrders(angular.extend({'page': page}, changedFilters()));
        };

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm);
        };

        $scope.sortBy = function (sortField) {
            if (SUPPORTED_FIELD.indexOf(sortField) !== -1) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                $scope.goToPage(1);
                loadPurchaseOrders();
            }
        };

        $scope.$watch('[fromDate,toDate,query]', function (newValue, oldValue) {
            if (angular.equals(newValue, oldValue)) return;
            $timeout(function () {
                $scope.initialize(changedFilters())
            }, 2000);
        }, true);

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

        $scope.selectPurchaseOrder = function (selectedPurchaseOrder) {
            if (selectedPurchaseOrder.isSingleIp == true) {
                $scope.showSingleIpMode(selectedPurchaseOrder);
            } else if (selectedPurchaseOrder.isSingleIp == false) {
                $scope.showMultipleIpMode(selectedPurchaseOrder);
            } else {
                LoaderService.showModal('select-modal-' + selectedPurchaseOrder.id);
            }
        };

        $scope.showSingleIpMode = function (selectedPurchaseOrder) {
            $location.path(rootPath + selectedPurchaseOrder.id + '/single');
        };

        $scope.showMultipleIpMode = function (selectedPurchaseOrder) {
            $location.path(rootPath + selectedPurchaseOrder.id + '/multiple');
        };

        $scope.exportToCSV = function () {
            ExportDeliveriesService.export('direct').then(function (response) {
                ngToast.create({content: response.data.message, class: 'info'});
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        };
    });

