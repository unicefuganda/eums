'use strict';

angular.module('StockReport', ['eums.config', 'ngTable', 'siTable', 'eums.ip', 'Consignee'])
    .controller('StockReportController', function (StockReportService, $scope) {
        $scope.selectedIPId = undefined;
        $scope.reportData = [];
        $scope.totals = {};

        $scope.$watch('selectedIPId', function (id) {
            if (id) {
                StockReportService.getStockReport(id).then(function (stockReport) {
                    $scope.reportData = stockReport.data;
                    $scope.totals = StockReportService.computeStockTotals($scope.reportData);
                });
            }
        });
    })
    .factory('StockReportService', function ($http, EumsConfig) {
        return {
            getStockReport: function (consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.STOCK_REPORT + consigneeId + '/');
            },
            computeStockTotals: function (stockReport) {
                return stockReport.reduce(function (previousValue, currentValue) {
                    return {
                        totalReceived: previousValue.totalReceived + Number(currentValue.total_value_received),
                        totalDispensed: previousValue.totalDispensed + Number(currentValue.total_value_dispensed),
                        totalBalance: previousValue.totalBalance + Number(currentValue.balance)
                    };

                }, {totalReceived: 0, totalDispensed: 0, totalBalance: 0});
            }};
    });