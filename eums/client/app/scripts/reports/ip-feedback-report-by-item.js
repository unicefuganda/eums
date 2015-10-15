'use strict';

angular.module('IpFeedbackReportByItem', ['eums.config', 'ReportService', 'Loader', 'Consignee', 'Programme'])
    .controller('IpFeedbackReportByItemController', function ($scope, $q, $location, $timeout, ReportService,
                                                              LoaderService) {
        $scope.searchTerm = {};
        $scope.programmesAndConsignees = {};

        $scope.$watchCollection('searchTerm', function (newSearchTerm, oldSearchTerm) {
            if (hasFields($scope.searchTerm)) {
                $scope.searching = true;
                $scope.resetPageNo(newSearchTerm, oldSearchTerm);
                loadIpFeedbackReport($scope.searchTerm);
            } else {
                loadIpFeedbackReport()
            }

            if (newSearchTerm.consigneeId != oldSearchTerm.consigneeId) {
                $scope.displayProgrammes = newSearchTerm.consigneeId ? $scope.programmesAndConsignees.allProgrammes.filter(function (programme) {
                    return _.contains(programme.ips, newSearchTerm.consigneeId);
                }) : $scope.programmesAndConsignees.allProgrammes;
                $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
            }

            if (newSearchTerm.programmeId != oldSearchTerm.programmeId) {
                var programme = newSearchTerm.programmeId ?
                    $scope.programmesAndConsignees.allProgrammes.filter(function (programme) {
                        return programme.id === newSearchTerm.programmeId;
                    })[0] : undefined;

                $scope.displayIps = programme ? $scope.programmesAndConsignees.allIps.filter(function (ip) {
                    return _.contains(programme.ips, ip.id);
                }) : $scope.programmesAndConsignees.allIps;
                $scope.populateIpsSelect2 && $scope.populateIpsSelect2($scope.displayIps);
            }
        }, true);

        $scope.resetPageNo = function(newSearchTerm, oldSearchTerm){
            if(newSearchTerm.consigneeId != oldSearchTerm.consigneeId
                || newSearchTerm.programmeId != oldSearchTerm.programmeId
                || newSearchTerm.itemDescription != oldSearchTerm.itemDescription
                || newSearchTerm.poWaybill != oldSearchTerm.poWaybill)
                $scope.searchTerm.page = 1;
        }

        $scope.goToPage = function (page) {
            $scope.searchTerm.page = page;
        };

        function hasFields(searchTerm) {
            return Object.keys(searchTerm).length > 0;
        }

        function loadIpFeedbackReport(filterParams) {
            $scope.searching ? LoaderService.hideLoader() : LoaderService.showLoader();
            ReportService.ipFeedbackReport(filterParams).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;

                updateProgrammes(response.programmeIds);
                updateConsignees(response.ipIds);

                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }

        function updateConsignees(ipIds) {
            if (ipIds && $scope.displayIps) {
                $scope.displayIps = ipIds ? $scope.programmesAndConsignees.allIps.filter(function (ip) {
                    return _.contains(ipIds, ip.id);
                }) : [];
            } else {
                $scope.displayIps = $scope.programmesAndConsignees.allIps;
            }
            $scope.populateIpsSelect2 && $scope.populateIpsSelect2($scope.displayIps);
        }

        function updateProgrammes(programmeIds) {
            if (programmeIds && $scope.displayProgrammes) {
                $scope.displayProgrammes = programmeIds ? $scope.programmesAndConsignees.allProgrammes.filter(function (programme) {
                    return _.contains(programmeIds, programme.id);
                }) : [];
            } else {
                $scope.displayProgrammes = $scope.programmesAndConsignees.allProgrammes;
            }

            $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
        }

        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };
    });