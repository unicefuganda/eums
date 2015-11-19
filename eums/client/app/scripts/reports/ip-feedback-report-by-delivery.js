'use strict';

angular.module('IpFeedbackReportByDelivery', ['eums.config', 'ReportService', 'Loader', 'EumsErrorMessage'])
    .controller('IpFeedbackReportByDeliveryController', function ($scope, $q, $timeout, $routeParams, ReportService, LoaderService,
                                                                  ErrorMessageService) {
            var timer,
                ORDER = ['desc', 'asc', null],
                INITIAL_ORDER = ORDER[0],
                SUPPORTED_FIELD = ['shipmentDate', 'dateOfReceipt', 'value'];


            $scope.searchTerm = {};
            $scope.directiveValues = {};
            $scope.pagination = {page: 1};
            $scope.sortOptions = {};

            var initializing = true;

            $scope.district = $routeParams.district ? $routeParams.district : "All Districts";

            function refreshReport() {
                if (initializing) {
                    loadIpFeedbackReportByDelivery();
                    initializing = false;
                } else {
                    if (timer) {
                        $timeout.cancel(timer);
                    }

                    if ($scope.searchTerm.poWaybill) {
                        startTimer();
                    } else {
                        loadIpFeedbackReportByDelivery($scope.searchTerm);
                    }
                }
            }

            $scope.$watchCollection('searchTerm', function () {
                refreshReport();
            });

            $scope.sortBy = function (sortField) {
                if (SUPPORTED_FIELD.indexOf(sortField) === -1) {
                    $scope.sortOptions = {};
                    return;
                }

                if ($scope.sortOptions.sortBy === sortField) {
                    var orderIndex = ORDER.indexOf($scope.sortOptions.order);
                    $scope.sortOptions.order = ORDER[(orderIndex + 1) % ORDER.length];

                } else {
                    $scope.sortOptions.sortBy = sortField;
                    $scope.sortOptions.order = INITIAL_ORDER;
                }

                if (!$scope.sortOptions.order) {
                    $scope.sortOptions = {};
                }
            };

            function startTimer() {
                timer = $timeout(function () {
                    startSearch();
                }, 2000);
            }

            function startSearch() {
                $scope.pagination.page = 1;
                if (hasFields($scope.searchTerm)) {
                    $scope.searching = true;
                    loadIpFeedbackReportByDelivery($scope.searchTerm);
                } else {
                    loadIpFeedbackReportByDelivery();
                }
            }

            function hasFields(searchTerm) {
                return Object.keys(searchTerm).length > 0;
            }

            $scope.goToPage = function (page) {
                $scope.pagination.page = page;
                loadIpFeedbackReportByDelivery($scope.searchTerm)
            };

            function appendLocationFilter(filterParams) {
                var location = $routeParams.district;
                if (location) {
                    return angular.extend({'location': location}, filterParams);
                }
                return filterParams;
            }

            function loadIpFeedbackReportByDelivery(filterParams) {
                LoaderService.showLoader();
                var allFilter = appendLocationFilter(filterParams);
                ReportService.ipFeedbackReportByDelivery(allFilter, $scope.pagination.page).then(function (response) {
                    $scope.report = response.results;
                    $scope.count = response.count;
                    $scope.pageSize = response.pageSize;

                    updateProgrammes(response.programmeIds);
                    updateConsignees(response.ipIds);
                }, function () {
                    ErrorMessageService.showError();
                }).finally(function () {
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
                $scope.displayProgrammes = programmeIds ? $scope.directiveValues.allProgrammes.filter(function (programme) {
                    return _.contains(programmeIds, programme.id);
                }) : [];

                $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
            }

            $scope.showRemarks = function (index) {
                var remarksModalId = 'remarks-modal-' + index;
                LoaderService.showModal(remarksModalId)
            };
        }
    )
;