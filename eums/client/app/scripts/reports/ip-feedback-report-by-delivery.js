'use strict';

angular.module('IpFeedbackReportByDelivery', ['eums.config', 'ReportService', 'Loader', 'Consignee', 'Programme'])
    .controller('IpFeedbackReportByDeliveryController', function ($scope, $q, $timeout, $routeParams, ReportService, LoaderService) {
        var timer;

        $scope.searchTerm = {};
        $scope.directiveValues = {};

        var initializing = true;

        $scope.district = $routeParams.district ? $routeParams.district : "All Districts";

        $scope.$watchCollection('searchTerm', function (newSearchTerm, oldSearchTerm) {
            if (initializing){
                loadIpFeedbackReportByDelivery();
                initializing = false;
            } else {
                if (timer) {
                    $timeout.cancel(timer);
                }

                startSearchTimer(newSearchTerm, oldSearchTerm);
            }
        }, true);

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
                loadIpFeedbackReportByDelivery($scope.searchTerm, newSearchTerm, oldSearchTerm);
            } else {
                loadIpFeedbackReportByDelivery();
            }
        }

        function hasFields(searchTerm) {
            return Object.keys(searchTerm).length > 0;
        }


        $scope.resetPageNo = function(newSearchTerm, oldSearchTerm){
            if(newSearchTerm.consigneeId != oldSearchTerm.consigneeId
                || newSearchTerm.programmeId != oldSearchTerm.programmeId
                || newSearchTerm.poWaybill != oldSearchTerm.poWaybill)
                $scope.searchTerm.page = 1;
        };

        $scope.goToPage = function (page) {
            loadIpFeedbackReportByDelivery({page: page})
        };

        function appendLocationFilter(filterParams){
            var location = $routeParams.district;
            if (location){
                return angular.extend({'location': location}, filterParams);
            }
            return filterParams;
        }

        function loadIpFeedbackReportByDelivery(filterParams, newSearchTerm, oldSearchTerm) {
           LoaderService.showLoader();
            var allFilter = appendLocationFilter(filterParams);
            ReportService.ipFeedbackReportByDelivery(allFilter).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;

                updateProgrammes(response.programmeIds);
                updateConsignees(response.ipIds);

                if(newSearchTerm && oldSearchTerm) {
                    applyFilters(newSearchTerm, oldSearchTerm);
                }
                LoaderService.hideLoader();
                $scope.searching = false;
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