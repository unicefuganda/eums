'use strict';

angular.module('Home', ['GlobalStats', 'DistributionPlan'])
    .controller('HomeController', function (DistributionReportService, $scope, DistributionPlanService) {
        $scope.filter = {received: '', notDelivered: '', receivedWithIssues: '', year: ''};
        $scope.datepicker = {from: false, to: false};
        $scope.clickedMarker = '';
        $scope.allMarkers = [];
        $scope.ip = '';
        $scope.shownMarkers = [];
        $scope.programme = '';
        $scope.notDeliveredChecked = false;
        $scope.deliveredChecked = false;

        DistributionPlanService.getAllConsigneeResponses().then(function (response) {
            var reports = response.data;
            $scope.totalStats = DistributionReportService.getTotals(reports);

            $scope.updateTotalStats = function (filterOptions) {
                $scope.totalStats = DistributionReportService.getTotals(reports, filterOptions);
            };
        });
    });
