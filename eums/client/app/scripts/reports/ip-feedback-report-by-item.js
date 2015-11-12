'use strict';

angular.module('IpFeedbackReportByItem', ['eums.config', 'ReportService', 'Loader'])
    .controller('IpFeedbackReportByItemController', function ($scope, $q, $location, $timeout, ReportService,
                                                              LoaderService) {
        var timer;
        $scope.searchTerm = {};
        $scope.directiveValues = {};
        $scope.pagination = {page: 1};

        var initializing = true;

        $scope.$watchCollection('searchTerm', function () {
            if (initializing) {
                loadIpFeedbackReport();
                initializing = false;
            } else {
                if (timer) {
                    $timeout.cancel(timer);
                }

                startSearchTimer();
            }
        }, true);

        $scope.goToPage = function (page) {
            $scope.pagination.page = page;
            loadIpFeedbackReport($scope.searchTerm)
        };

        function startSearchTimer() {
            timer = $timeout(function () {
                startSearch();
            }, 2000);
        }

        function startSearch() {
            $scope.pagination.page = 1;
            if (hasFields($scope.searchTerm)) {
                $scope.searching = true;
                loadIpFeedbackReport($scope.searchTerm);
            } else {
                loadIpFeedbackReport();
            }
        }

        function hasFields(searchTerm) {
            return Object.keys(searchTerm).length > 0;
        }

        function loadIpFeedbackReport(filterParams) {
            LoaderService.showLoader();
            ReportService.ipFeedbackReport(filterParams, $scope.pagination.page).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
                updateProgrammes(response.programmeIds);
                updateConsignees(response.ipIds);

                $scope.searching = false;
                LoaderService.hideLoader();
            });
        }

        function updateConsignees(ipIds) {
            if (ipIds && $scope.displayIps) {
                $scope.displayIps = ipIds ? $scope.directiveValues.allIps.filter(function (ip) {
                    return _.contains(ipIds, ip.id);
                }) : [];
            } else {
                $scope.displayIps = $scope.directiveValues.allIps;
            }
            $scope.populateIpsSelect2 && $scope.populateIpsSelect2($scope.displayIps);
        }

        function updateProgrammes(programmeIds) {
            $scope.displayProgrammes = $scope.directiveValues.allProgrammes.filter(function (programme) {
                return _.contains(programmeIds, programme.id);
            });
            $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
        }

        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };
    });