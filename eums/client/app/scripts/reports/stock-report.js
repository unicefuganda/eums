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

        function handleReport(stockReport, message) {
            if (stockReport.data.length > 0) {
                $scope.reportData = stockReport.data;
                $scope.totals = StockReportService.computeStockTotals($scope.reportData);
                $scope.openDocument = undefined;
            }
            else {
                $scope.reportData = [];
                createToast('There is no data ' + message, 'danger');
            }
        }


        $scope.$watch('reportParams.selectedIPId', function (id) {
            if (id && $scope.reportParams.selectedLocation) {
                StockReportService.getStockReportForLocationAndConsignee($scope.reportParams.selectedLocation, id)
                    .then(function (stockReport) {
                        handleReport(stockReport, 'for the selected!');
                    });
            } else if (id) {
                StockReportService.getStockReportForConsignee(id).then(function (stockReport) {
                    handleReport(stockReport, 'for this IP!');
                });
            } else {
                StockReportService.getStockReport().then(function (stockReport) {
                    handleReport(stockReport);
                });
            }
        });

        $scope.$watch('reportParams.selectedLocation', function (location) {
                if (location && $scope.reportParams.selectedIPId) {
                    StockReportService.getStockReportForLocationAndConsignee(location, $scope.reportParams.selectedIPId)
                        .then(function (stockReport) {
                            handleReport(stockReport, 'for the selected!');
                        });
                } else if (location) {
                    StockReportService.getStockReportForLocation(location)
                        .then(function (stockReport) {
                            handleReport(stockReport, 'for this Location!');
                        });
                }
                else {
                    StockReportService.getStockReport()
                        .then(function (stockReport) {
                            handleReport(stockReport);
                        });
                }
            }
        )
        ;

        $scope.toggleOpenDocument = function (documentId) {
            $scope.openDocument = $scope.openDocument === documentId ? undefined : documentId;
        };
    })
    .factory('StockReportService', function ($http, EumsConfig) {
        return {
            getStockReportForLocationAndConsignee: function (location, consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.STOCK_REPORT + '?location=' + location + '&consignee=' + consigneeId);
            },
            getStockReportForConsignee: function (consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.STOCK_REPORT + '?consignee=' + consigneeId);
            },
            getStockReportForLocation: function (location) {
                return $http.get(EumsConfig.BACKEND_URLS.STOCK_REPORT + '?location=' + location);
            },
            getStockReport: function () {
                return $http.get(EumsConfig.BACKEND_URLS.STOCK_REPORT);
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