'use strict';

angular.module('IpFeedbackReportByItem', ['eums.config', 'ReportService', 'Loader', 'Consignee', 'Programme'])
    .controller('IpFeedbackReportByItemController', function ($scope, $q, $location, $timeout, ReportService,
                                                              LoaderService) {
        $scope.searchTerm = {};
        $scope.programmesAndConsignees = {};

        $scope.$watchCollection('searchTerm', function (newValue, oldValue) {
            if (hasFields($scope.searchTerm)) {
                $scope.searching = true;
                loadIpFeedbackReport($scope.searchTerm);
            } else {
                loadIpFeedbackReport()
            }

            if (newValue.consigneeId != oldValue.consigneeId) {
                $scope.displayProgrammes = newValue.consigneeId ? $scope.programmesAndConsignees.allProgrammes.filter(function (programme) {
                    return _.contains(programme.ips, newValue.consigneeId);
                }) : $scope.programmesAndConsignees.allProgrammes;
                $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
            }

            if (newValue.programmeId != oldValue.programmeId) {
                var programme = newValue.programmeId ?
                    $scope.programmesAndConsignees.allProgrammes.filter(function (programme) {
                        return programme.id === newValue.programmeId;
                    })[0] : undefined;

                $scope.displayIps = programme ? $scope.programmesAndConsignees.allIps.filter(function (ip) {
                    return _.contains(programme.ips, ip.id);
                }) : $scope.programmesAndConsignees.allIps;
                $scope.populateIpsSelect2 && $scope.populateIpsSelect2($scope.displayIps);
            }
        }, true);

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