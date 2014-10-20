'use strict';

angular.module('Home', ['GlobalStats'])
    .controller('HomeController', function (DistributionReportService, $scope) {
        $scope.filter = {};
        $scope.clickedMarker = "";
        $scope.allmarkers = [];
        $scope.shownMarkers = [];
        $scope.programme = '';
        $scope.notDeliveredChecked = false;
        $scope.deliveredChecked = false;

        DistributionReportService.getReports().then(function (returnedReports) {
            var reports = returnedReports;
            $scope.totalStats = DistributionReportService.getTotals(reports);

            $scope.updateTotalStats = function (filterOptions) {
                $scope.totalStats = DistributionReportService.getTotals(reports, filterOptions);
            };
        });
    });
