'use strict';

angular.module('StockReport', [
    'eums.config', 'ngTable', 'siTable', 'ngToast', 'eums.ip', 'Consignee', 'Directives', 'Loader'])
    .controller('StockReportController', function (StockReportService, $scope, ngToast, IPService, LoaderService) {
        $scope.reportParams = {};
        $scope.reportData = [];
        $scope.totals = {};

        function init() {
            loadDistricts();
            fetchReport();
        }

        function loadDistricts() {
            IPService.loadAllDistricts().then(function (response) {
                $scope.districts = response.data.map(function (district) {
                    return {id: district, name: district};
                });
                $scope.districtsLoaded = true;
            });
        }

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }

        $scope.goToPage = function (page) {
            fetchReport({page: page});
        };

        function handleReport(response) {
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
            if (response.results.length > 0) {
                $scope.reportData = response.results;
                $scope.totals = response.totals;
                $scope.openDocument = undefined;
            }
            else {
                $scope.reportData = [];
                $scope.totals = response.totals;
                createToast('There is no data for the specified filters!', 'danger');
            }
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
            if (params) {
                Object.merge(requestParams, params);
            }
            StockReportService.getStockReport(requestParams).then(function (response) {
                handleReport(response.data);
                LoaderService.hideLoader();
            });
        }

        $scope.$watch('reportParams.selectedIPId', function (newIPId, oldIPId) {
            if (newIPId != oldIPId) {
                fetchReport();
            }
        });

        $scope.$watch('reportParams.selectedLocation', function (newLocation, oldLocation) {
            if (newLocation != oldLocation) {
                fetchReport();
            }
        });

        $scope.toggleOpenDocument = function (documentId) {
            $scope.openDocument = $scope.openDocument === documentId ? undefined : documentId;
        };

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