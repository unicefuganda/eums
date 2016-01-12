'use strict';

angular.module('DirectDelivery', ['eums.config', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'SortBy',
        'Directives', 'EumsFilters', 'Loader', 'ExportDeliveries', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('DirectDeliveryController', function ($scope, $location, ProgrammeService, SortByService, SortArrowService,
                                                      SortService, PurchaseOrderService, UserService, IPService, $sorter,
                                                      LoaderService, ExportDeliveriesService, ngToast, $timeout) {

        var rootPath = '/direct-delivery/new/';
        var SUPPORTED_FIELD = ['orderNumber', 'date', 'trackedDate', 'lastShipmentDate', 'poType', 'programmeName'];
        var timer;
        var initializing = true;

        $scope.searchFields = ['orderNumber', 'lastShipmentDate'];
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.purchaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;
        $scope.directiveValues = {};

        $scope.pagination = {page: 1};
        $scope.searchTerm = {};
        $scope.sortTerm = {field: 'trackedDate', order: 'desc'};

        $scope.documentColumnTitle = 'Purchase Order';
        $scope.dateColumnTitle = 'Date Created';
        $scope.trackedDateColumnTitle = 'Tracked Date';
        $scope.lastShipmentDateColumnTitle = 'Last Shipment Date';
        $scope.poTypeColumnTitle = 'PO Type';
        $scope.outcomeColumnTitle = 'Outcome';

        $scope.$watchCollection('searchTerm', function (oldSearchTerm, newSearchTerm) {
            $scope.pagination.page = 1;
            if (initializing) {
                loadPurchaseOrders();
                initializing = false;
            } else {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }

                if (oldSearchTerm.itemDescription != newSearchTerm.itemDescription ||
                    oldSearchTerm.purchaseOrder != newSearchTerm.purchaseOrder) {
                    startTimer();
                } else {
                    loadPurchaseOrders();
                }
            }
        });

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm);
        };

        $scope.goToPage = function (page) {
            $scope.pagination.page = page;
            loadPurchaseOrders();
        };

        // todo: to check if this function is useful
        $scope.convertToDate = function (dateString) {
            return Date.parse(dateString);
        };

        $scope.sortBy = function (sortField) {
            if (_.include(SUPPORTED_FIELD, sortField)) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                $scope.goToPage(1);
            }
        };

        // todo: to check if this function is useful
        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        $scope.exportToCSV = function () {
            // todo: export items with filters, e.g: item-feedback-report
            ExportDeliveriesService.export('direct').then(function (response) {
                ngToast.create({content: response.data.message, class: 'info'});
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        };

        // todo: remove ng-init="initialize" from corresponding html
        $scope.initialize = function () {
            loadPurchaseOrders();
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

        function formatDate(date) {
            // todo: use formate-date from SysUtilsService instead of construct it our own
            //return SysUtilsService.formatDate(date);
            return moment(date).format('YYYY-MM-DD')
        }

        function startTimer() {
            timer = $timeout(function () {
                loadPurchaseOrders()
            }, 2000);
        }

        function loadPurchaseOrders() {
            LoaderService.showLoader();
            var allFilters = angular.extend({
                'paginate': 'true',
                'page': $scope.pagination.page
            }, getSearchTerms(), $scope.sortTerm);

            PurchaseOrderService.forDirectDelivery(undefined, allFilters).then(function (response) {
                $scope.purchaseOrders = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
                updateProgrammes(response.programmeIds);
            }).catch(function () {
                ngToast.create({content: 'Failed to load purchase orders', class: 'danger'});
            }).finally(function () {
                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }

        function updateProgrammes(programmeIds) {
            $scope.displayProgrammes = programmeIds ? $scope.directiveValues.allProgrammes.filter(function (programme) {
                return _.contains(programmeIds, programme.id);
            }) : [];

            if (!_.isEmpty($scope.displayProgrammes)) {
                $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
            }
        }

        function getSearchTerms() {
            var filters = _($scope.searchTerm).omit(_.isUndefined).omit(_.isNull).value();
            if (filters.fromDate)
                filters.fromDate = formatDate(filters.fromDate);
            if (filters.toDate)
                filters.toDate = formatDate(filters.toDate);
            return filters;
        }
    });
