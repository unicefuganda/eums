'use strict';

angular.module('EndUserFeedbackReport', ['eums.config', 'ReportService', 'Loader'])
    .controller('EndUserFeedbackReportController', function ($scope, $q, $location, $timeout, ReportService, LoaderService) {
        var timer;

        $scope.$watch('searchTerm', function () {
            if ($scope.searchTerm && $scope.searchTerm.trim()) {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }
                startTimer();
            } else {
                loadEndUserFeedbackReport()
            }
        });

        $scope.goToPage = function (page) {
            loadEndUserFeedbackReport({page: page})
        };

        function startTimer() {
            timer = $timeout(function () {
                loadEndUserFeedbackReport({query: $scope.searchTerm})
            }, 1000);
        }

        function loadEndUserFeedbackReport(filterParams) {
            $scope.searching ? LoaderService.hideLoader() : LoaderService.showLoader();
            ReportService.endUserFeedbackReport(filterParams).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;

                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }
    });