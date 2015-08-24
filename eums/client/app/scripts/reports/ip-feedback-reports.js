'use strict';

angular.module('IpFeedbackReports', ['eums.config', 'ReportService', 'Loader'])
    .controller('IpFeedbackReportsController', function ($scope, $q, $location, ReportService, LoaderService) {

        LoaderService.showLoader();
        ReportService.ipFeedbackReport()
            .then(function(report){
                $scope.report = report;
                LoaderService.hideLoader();
        })
    });