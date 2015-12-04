'use strict';

angular.module('DirectDelivery', ['eums.config', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives', 'EumsFilters', 'Loader', 'ExportDeliveries', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('DirectDeliveryController', function ($scope, $location, ProgrammeService, PurchaseOrderService, UserService, $sorter, LoaderService, ExportDeliveriesService, ngToast, $timeout) {

        var rootPath = '/direct-delivery/new/';


        $scope.sortBy = $sorter;
        $scope.searchFields = ['orderNumber', 'date'];
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

        function loadPurchaseOrders(options) {
            LoaderService.showLoader();
            options = angular.extend({'paginate': 'true'}, options);

            PurchaseOrderService.forDirectDelivery(undefined, options).then(function (response) {
                $scope.purchaseOrders = response.results.sort();
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
                LoaderService.hideLoader();
            }).catch(function () {
                ngToast.create({content: 'Failed to load purchase orders', class: 'danger'});
            });
        }

        $scope.initialize = function (urlArgs) {
            this.sortBy('trackedDate');
            this.sort.descending = false;

            loadPurchaseOrders(urlArgs);
        };

        $scope.goToPage = function (page) {
            loadPurchaseOrders(angular.extend({'page': page}, changedFilters()));
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

    })
    .factory('$sorter', function () {
        return function (field) {
            this.sort = this.sort || {};
            angular.extend(this.sort, {criteria: field, descending: !this.sort.descending});
        };
    });

