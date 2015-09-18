'use strict';

angular.module('IpFeedbackReportByItem', ['eums.config', 'ReportService', 'Loader'])
    .controller('IpFeedbackReportByItemController', function ($scope, $q, $location, $timeout, ReportService, LoaderService) {
        var timer;

        $scope.$watch('searchTerm', function () {
            if ($scope.searchTerm && $scope.searchTerm.trim()) {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }
                startTimer();
            } else {
                loadIpFeedbackReport()
            }
        });

        $scope.goToPage = function (page) {
            loadIpFeedbackReport({page: page})
        };

        function startTimer() {
            timer = $timeout(function () {
                loadIpFeedbackReport({query: $scope.searchTerm})
            }, 1000);
        }

        function loadIpFeedbackReport(filterParams) {
            $scope.searching ? LoaderService.hideLoader() : LoaderService.showLoader();
            ReportService.ipFeedbackReport(filterParams).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;

                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }

        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };
    });