'use strict';

angular.module('Home', ['GlobalStats'])
    .controller('HomeController', function (DistributionReportService, $scope) {
        DistributionReportService.getReports().then(function (returnedReports) {
            var reports = returnedReports;
            $scope.totalStats = DistributionReportService.getTotals(reports);

            $scope.updateTotalStats = function (filterOptions) {
                console.log(filterOptions);
                $scope.totalStats = DistributionReportService.getTotals(reports, filterOptions);
            };
        });
    });
