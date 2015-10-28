'use strict';

angular.module('IpFeedbackReportByItem', ['eums.config', 'ReportService', 'Loader', 'Consignee', 'Programme'])
    .controller('IpFeedbackReportByItemController', function ($scope, $q, $location, $timeout, ReportService,
                                                              LoaderService) {
        var timer;
        $scope.searchTerm = {};
        $scope.directiveValues = {};

        var initializing = true;

        $scope.$watchCollection('searchTerm', function (newSearchTerm, oldSearchTerm) {
            if (initializing){
                loadIpFeedbackReport();
                initializing = false;
            } else {
                if (timer) {
                    $timeout.cancel(timer);
                }

                startSearchTimer(newSearchTerm, oldSearchTerm);
            }
        }, true);

        $scope.resetPageNo = function(newSearchTerm, oldSearchTerm){
            if(newSearchTerm.consigneeId != oldSearchTerm.consigneeId
                || newSearchTerm.programmeId != oldSearchTerm.programmeId
                || newSearchTerm.itemDescription != oldSearchTerm.itemDescription
                || newSearchTerm.poWaybill != oldSearchTerm.poWaybill)
                $scope.searchTerm.page = 1;
        };

        $scope.goToPage = function (page) {
            $scope.searchTerm.page = page;
        };

        function startSearchTimer(newSearchTerm, oldSearchTerm) {
            timer = $timeout(function () {
                startSearch(newSearchTerm, oldSearchTerm);
            }, 2000);
        }

        function applyFilters(newSearchTerm, oldSearchTerm) {
            if (newSearchTerm.consigneeId != oldSearchTerm.consigneeId) {
                $scope.displayProgrammes = newSearchTerm.consigneeId ? $scope.directiveValues.allProgrammes.filter(function (programme) {
                    return _.contains(programme.ips, newSearchTerm.consigneeId);
                }) : $scope.directiveValues.allProgrammes;
                $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
            }

            if (newSearchTerm.programmeId != oldSearchTerm.programmeId) {
                var programme = newSearchTerm.programmeId ?
                    $scope.directiveValues.allProgrammes.filter(function (programme) {
                        return programme.id === newSearchTerm.programmeId;
                    })[0] : undefined;

                $scope.displayIps = programme ? $scope.directiveValues.allIps.filter(function (ip) {
                    return _.contains(programme.ips, ip.id);
                }) : $scope.directiveValues.allIps;
                $scope.populateIpsSelect2 && $scope.populateIpsSelect2($scope.displayIps);
            }
        }

        function startSearch(newSearchTerm, oldSearchTerm) {
            if (hasFields($scope.searchTerm)) {
                $scope.searching = true;
                $scope.resetPageNo(newSearchTerm, oldSearchTerm);
                loadIpFeedbackReport($scope.searchTerm, newSearchTerm, oldSearchTerm);
            } else {
                loadIpFeedbackReport();
            }
        }

        function hasFields(searchTerm) {
            return Object.keys(searchTerm).length > 0;
        }

        function loadIpFeedbackReport(filterParams, newSearchTerm, oldSearchTerm) {
            LoaderService.showLoader();
            ReportService.ipFeedbackReport(filterParams).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;

                updateProgrammes(response.programmeIds);
                updateConsignees(response.ipIds);

                if(newSearchTerm && oldSearchTerm) {
                    applyFilters(newSearchTerm, oldSearchTerm);
                }

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
            if (programmeIds && $scope.displayProgrammes) {
                $scope.displayProgrammes = programmeIds ? $scope.directiveValues.allProgrammes.filter(function (programme) {
                    return _.contains(programmeIds, programme.id);
                }) : [];
            } else {
                $scope.displayProgrammes = $scope.directiveValues.allProgrammes;
            }

            $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
        }

        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };
    });