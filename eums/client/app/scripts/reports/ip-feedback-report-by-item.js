'use strict';

angular.module('IpFeedbackReportByItem', ['eums.config', 'ReportService', 'Loader', 'Consignee', 'Programme'])
    .controller('IpFeedbackReportByItemController', function ($scope, $q, $location, $timeout, ReportService, LoaderService, ConsigneeService,
                                                              ProgrammeService) {
        var timer;
        $scope.searchTerm = { };

        ConsigneeService.filter({type: 'implementing_partner'}).then(function(response){
            $scope.consignees = response;
        });

        ProgrammeService.all().then(function(response){
            $scope.programmes = response;
        });

        $scope.$watchCollection('searchTerm', function () {
            if (hasFields($scope.searchTerm)) {
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
                loadIpFeedbackReport($scope.searchTerm)
            }, 1000);
        }

        function hasFields(searchTerm) {
            return Object.keys(searchTerm).length > 0;
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