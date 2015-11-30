'use strict';

angular.module('StockReport', [
        'eums.config', 'ngTable', 'siTable', 'eums.ip', 'Consignee', 'Directives', 'Loader', 'User', 'EumsErrorMessage', 'Sort', 'SortArrow', 'SysUtils'])
    .controller('StockReportController', function (StockReportService, $scope, ConsigneeService, IPService, LoaderService, UserService,
                                                   ErrorMessageService, SortService, SortArrowService, SysUtilsService) {
        var SUPPORTED_FIELD = ['last_shipment_date', 'last_received_date', 'total_value_received', 'total_value_dispensed', 'balance'];
        $scope.reportParams = {};
        $scope.totals = {};
        $scope.isIpUser = false;
        $scope.sortTerm = {field: 'last_shipment_date', order: 'desc'};


        function init() {
            loadDistricts();
            UserService.getCurrentUser().then(function (user) {
                if (user && user.consignee_id) {
                    $scope.isIpUser = true;
                    $scope.reportParams.selectedIPId = user.consignee_id;
                    ConsigneeService.get(user.consignee_id).then(function (ip) {
                        $scope.$broadcast('set-consignee', ip);
                    });
                }
                fetchReport();
            });
        }

        function loadDistricts() {
            IPService.loadAllDistricts().then(function (response) {
                $scope.districts = response.data.map(function (district) {
                    return {id: district, name: district};
                });
                $scope.districtsLoaded = true;
            });
        }

        $scope.goToPage = function (page) {
            fetchReport({page: page});
        };

        $scope.sortBy = function (sortField) {
            if (SUPPORTED_FIELD.indexOf(sortField) !== -1) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                fetchReport()
            }
        };

        function appendSortParam(requestParams) {
            return angular.extend({}, requestParams, $scope.sortTerm);
        }

        function fetchReport(params) {
            LoaderService.showLoader();
            var requestParams = {};
            if ($scope.reportParams.selectedLocation) {
                Object.merge(requestParams, {location: $scope.reportParams.selectedLocation})
            }
            if ($scope.reportParams.selectedIPId) {
                Object.merge(requestParams, {consignee: $scope.reportParams.selectedIPId});
            }
            if ($scope.reportParams.selectedOutcomeId) {
                Object.merge(requestParams, {outcome: $scope.reportParams.selectedOutcomeId});
            }
            if ($scope.reportParams.selectedFromDate) {
                Object.merge(requestParams, {fromDate: formatDate($scope.reportParams.selectedFromDate)});
            }
            if ($scope.reportParams.selectedToDate) {
                Object.merge(requestParams, {toDate: formatDate($scope.reportParams.selectedToDate)});
            }
            if (params) {
                Object.merge(requestParams, params);
            }
            requestParams = appendSortParam(requestParams);
            StockReportService.getStockReport(requestParams).then(function (response) {
                $scope.count = response.data.count;
                $scope.pageSize = response.data.pageSize;
                $scope.reportData = response.data.results;
                $scope.totals = response.data.totals;
                $scope.openDocument = undefined;
            }, function () {
                ErrorMessageService.showError('An error occurred. Please refresh and try again.');
            }).finally(function () {
                LoaderService.hideLoader();
            });
        }

        $scope.hasEmptyDataResponse = function () {
            return ($scope.reportData != undefined && $scope.reportData.length === 0);
        };

        $scope.$watch('reportParams.selectedIPId', function (newIPId, oldIPId) {
            if (newIPId != oldIPId)
                fetchReport();
        });

        $scope.$watch('reportParams.selectedLocation', function (newLocation, oldLocation) {
            if (newLocation != oldLocation)
                fetchReport();
        });

        $scope.$watch('reportParams.selectedOutcomeId', function (newOutcomeId, oldOutcomeId) {
            if (newOutcomeId != oldOutcomeId)
                fetchReport();
        });

        $scope.$watch('reportParams.selectedFromDate', function (newFromDate, oldFromDate) {
            if (newFromDate != oldFromDate)
                fetchReport();
        });

        $scope.$watch('reportParams.selectedToDate', function (newToDate, oldToDate) {
            if (newToDate != oldToDate)
                fetchReport();
        });

        $scope.toggleOpenDocument = function (documentId) {
            $scope.openDocument = $scope.openDocument === documentId ? undefined : documentId;
        };

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm);
        };

        $scope.formatDate = function (date) {
            return SysUtilsService.formatDate(date);
        };

        function formatDate(date) {
            return moment(date).format('YYYY-MM-DD')
        }

        init();
    })
    .factory('StockReportService', function ($http, EumsConfig) {
        return {
            getStockReport: function (requestParams) {
                var url = EumsConfig.BACKEND_URLS.STOCK_REPORT;
                if (requestParams) {
                    url += '?' + $.param(requestParams);
                }
                return $http.get(url);
            }
        };
    });
