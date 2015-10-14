'use strict';

angular.module('StockReport', ['eums.config', 'ngTable', 'siTable', 'ngToast', 'eums.ip', 'Consignee', 'Directives'])
    .controller('StockReportController', function (StockReportService, $scope, ngToast, IPService) {
        $scope.reportParams = {};
        $scope.reportData = [];
        $scope.totals = {};

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
            $scope.districtsLoaded = true;
        });

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
                $scope.totals = StockReportService.computeStockTotals($scope.reportData);
                $scope.openDocument = undefined;
            }
            else {
                $scope.reportData = [];
                createToast('There is no data for the specified filters!', 'danger');
            }
        }

        function fetchReport(params) {
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
            });
        }

        $scope.$watch('reportParams.selectedIPId', function (id) {
            $scope.reportParams.selectedIPId = id;

            fetchReport();
        });

        $scope.$watch('reportParams.selectedLocation', function (location) {
            $scope.reportParams.selectedLocation = location;

            fetchReport();
        });

        $scope.toggleOpenDocument = function (documentId) {
            $scope.openDocument = $scope.openDocument === documentId ? undefined : documentId;
        };
    })
    .factory('StockReportService', function ($http, EumsConfig) {
        return {
            getStockReport: function (requestParams) {
                var url = EumsConfig.BACKEND_URLS.STOCK_REPORT;
                if (requestParams) {
                    url += '?' + $.param(requestParams);
                }
                return $http.get(url);
            },
            computeStockTotals: function (stockReport) {
                return stockReport.reduce(function (previousValue, currentValue) {
                    return {
                        totalReceived: previousValue.totalReceived + Number(currentValue.total_value_received),
                        totalDispensed: previousValue.totalDispensed + Number(currentValue.total_value_dispensed),
                        totalBalance: previousValue.totalBalance + Number(currentValue.balance)
                    };

                }, {totalReceived: 0, totalDispensed: 0, totalBalance: 0});
            }
        };
    });