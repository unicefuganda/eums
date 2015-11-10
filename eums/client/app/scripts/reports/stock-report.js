'use strict';

angular.module('StockReport', [
        'eums.config', 'ngTable', 'siTable', 'ngToast', 'eums.ip', 'Consignee', 'Directives', 'Loader', 'User'])
    .controller('StockReportController', function (StockReportService, $scope, ngToast, IPService, LoaderService, UserService) {
        $scope.reportParams = {};
        $scope.totals = {};
        $scope.isIpUser = false;

        function init() {
            loadDistricts();
            UserService.getCurrentUser().then(function (user) {
                if (user && user.consignee_id) {
                    $scope.isIpUser = true;
                    $scope.reportParams.selectedIPId = user.consignee_id;
                } else {
                    $scope.$broadcast('clear-consignee');
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
            StockReportService.getStockReport(requestParams).then(function (response) {
                $scope.count = response.data.count;
                $scope.pageSize = response.data.pageSize;
                $scope.reportData = response.data.results;
                $scope.totals = response.data.totals;
                $scope.openDocument = undefined;
            }, function () {
                var errorMessage = 'An error occurred. Please refresh and try again.'
                ngToast.create({content: errorMessage, class: 'danger'});
            }).finally(function () {
                LoaderService.hideLoader();
            });
        };

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
