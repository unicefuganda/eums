'use strict';

angular.module('IpFeedbackReportByItem', ['eums.config', 'ReportService', 'Loader', 'Consignee', 'Programme'])
    .controller('IpFeedbackReportByItemController', function ($scope, $q, $location, $timeout, ReportService,
                                                              LoaderService) {
        var timer;
        $scope.searchTerm = {};
        $scope.progAndConsignees = {};

        $scope.$watchCollection('searchTerm', function (newValue, oldValue) {
            if (hasFields($scope.searchTerm)) {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }
                startTimer();
            } else {
                loadIpFeedbackReport()
            }

            if (newValue.consigneeId != oldValue.consigneeId) {
                $scope.displayProgrammes = newValue.consigneeId ? $scope.progAndConsignees.allProgrammes.filter(function (programme) {
                    return _.contains(programme.ips, newValue.consigneeId);
                }) : $scope.progAndConsignees.allProgrammes;
                $scope.populateProgrammesSelect2();
            }

            if (newValue.programmeId != oldValue.programmeId) {
                var programme = newValue.programmeId ?
                    $scope.progAndConsignees.allProgrammes.filter(function (programme) {
                        return programme.id === newValue.programmeId;
                    })[0] : undefined;

                $scope.displayIps = programme ? $scope.progAndConsignees.allIps.filter(function (ip) {
                    return _.contains(programme.ips, ip.id);
                }) : $scope.progAndConsignees.allIps;
                $scope.populateIpsSelect2();
            }
        }, true);

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