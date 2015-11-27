'use strict';

angular.module('IpFeedbackReportByDelivery', ['eums.config', 'ReportService', 'Loader', 'EumsErrorMessage', 'Sort', 'SortArrow', 'SysUtils'])
    .controller('IpFeedbackReportByDeliveryController', function ($scope, $q, $timeout, $routeParams, ReportService, LoaderService,
                                                                  ErrorMessageService, SortService, SortArrowService, SysUtilsService) {
            var timer,
                SUPPORTED_FIELD = ['shipmentDate', 'dateOfReceipt', 'value'];


            $scope.searchTerm = {};
            $scope.directiveValues = {};
            $scope.pagination = {page: 1};
            $scope.sortOptions = {};

            var initializing = true;

            $scope.district = $routeParams.district ? $routeParams.district : "All Districts";

            function refreshReport(sortOptions) {
                if (initializing) {
                    loadIpFeedbackReportByDelivery(sortOptions);
                    initializing = false;
                } else {
                    if (timer) {
                        $timeout.cancel(timer);
                    }

                    if ($scope.searchTerm.poWaybill) {
                        startTimer();
                    } else {
                        loadIpFeedbackReportByDelivery(angular.extend($scope.searchTerm, sortOptions));
                    }
                }
            }

            $scope.$watchCollection('searchTerm', function () {
                refreshReport($scope.sortOptions);
            });

            $scope.sortBy = function (sortField) {
                if (SUPPORTED_FIELD.indexOf(sortField) !== -1) {
                    $scope.sortOptions = SortService.sortBy(sortField);
                    refreshReport($scope.sortOptions)
                }
            };

            $scope.sortArrowClass = function (criteria) {
                return SortArrowService.setSortArrow(criteria, $scope.sortOptions)
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

            function loadIpFeedbackReportByDelivery(queryParams) {
                LoaderService.showLoader();
                var allFilter = appendLocationFilter(queryParams);
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

            $scope.formatDate = function (date) {
                return SysUtilsService.formatDate(date)
            };
        }
    )
;
