'use strict';

angular.module('IpFeedbackReportByDelivery', ['eums.config', 'ReportService', 'Loader'])
    .controller('IpFeedbackReportByDeliveryController', function ($scope, $q, ReportService, LoaderService) {

        loadIpFeedbackReport();

        $scope.goToPage = function (page) {
            loadIpFeedbackReport({page: page})
        };

        function loadIpFeedbackReport(filterParams) {
            $scope.searching ? LoaderService.hideLoader() : LoaderService.showLoader();
            ReportService.ipFeedbackReportByDelivery(filterParams).then(function (response) {
                $scope.report = response.results;

                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }
    });