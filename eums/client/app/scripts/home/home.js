'use strict';

angular.module('Home', ['GlobalStats'])
    .controller('HomeController', function(DistributionReportService, $scope) {
        DistributionReportService.getReports().then(function(returnedReports) {
            $scope.totalStats = DistributionReportService.getTotals(returnedReports);
        });
    });
