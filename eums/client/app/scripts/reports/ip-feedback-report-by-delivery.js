'use strict';

angular.module('IpFeedbackReportByDelivery', ['eums.config', 'ReportService', 'Loader'])
    .controller('IpFeedbackReportByDeliveryController', function ($scope, $q, $timeout, ReportService, LoaderService) {
        var timer;

        $scope.$watch('searchTerm', function () {
            if ($scope.searchTerm && $scope.searchTerm.trim()) {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }
                startTimer();
            } else {
                loadIpFeedbackReportByDelivery()
            }
        });

        $scope.goToPage = function (page) {
            loadIpFeedbackReportByDelivery({page: page})
        };

        function loadIpFeedbackReportByDelivery(filterParams) {
            $scope.searching ? LoaderService.hideLoader() : LoaderService.showLoader();
            ReportService.ipFeedbackReportByDelivery(filterParams).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;

                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }


        function startTimer() {
            timer = $timeout(function () {
                loadIpFeedbackReportByDelivery({query: $scope.searchTerm})
            }, 1000);
        }
    });