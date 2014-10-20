'use strict';

angular.module('Home', ['GlobalStats'])
    .controller('HomeController', function (DistributionReportService, $scope) {
        $scope.filter = {received: '', notDelivered: '', receivedWithIssues: '', year: ''};
        $scope.datepicker = {from: false, to: false};
        $scope.clickedMarker = '';
        $scope.allMarkers = [];
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
