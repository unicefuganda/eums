'use strict';

angular.module('IpFeedbackReports', ['eums.config', 'ReportService'])
    .controller('IpFeedbackReportsController', function ($scope, $q, $location, ReportService) {
        ReportService.ipFeedbackReport()
            .then(function(report){
                $scope.report = report;
        })
    });