'use strict';

angular.module('StockReport', ['eums.config', 'ngTable', 'siTable', 'ngToast', 'eums.ip', 'Consignee'])
    .controller('StockReportController', function (StockReportService, $scope, ngToast) {
        $scope.selectedIPId = undefined;
        $scope.reportData = [];
        $scope.totals = {};

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }

        $scope.$watch('selectedIPId', function (id) {
            if (id) {
                StockReportService.getStockReport(id).then(function (stockReport) {
                    if (stockReport.data.length > 0) {
                        $scope.reportData = stockReport.data;
                        $scope.totals = StockReportService.computeStockTotals($scope.reportData);
                    }
                    else {
                        $scope.reportData = [];
                        createToast('There is no data for this IP', 'danger');
                    }
                });
            }
        });

        $scope.toggleOpenDocument = function(documentId) {
            $scope.openDocument = $scope.openDocument === documentId ? undefined : documentId;
        };
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