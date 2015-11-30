'use strict';

angular.module('ItemFeedbackReport', ['eums.config', 'ReportService', 'Loader', 'EumsErrorMessage', 'Option', 'Sort', 'SortArrow', 'SysUtils'])
    .controller('ItemFeedbackReportController', function ($scope, $q, $location, $timeout, $routeParams,
                                                          ReportService, LoaderService, ErrorMessageService, OptionService, SortService, SortArrowService, SysUtilsService) {
        var SUPPORTED_FIELD = ['quantity_shipped', 'value', 'dateOfReceipt', 'amountReceived'];
        var timer;

        $scope.searchTerm = {};
        $scope.directiveValues = {};
        $scope.pagination = {page: 1};
        $scope.sortTerm = {field: 'dateOfReceipt', order: 'desc'};
        $scope.district = $routeParams.district ? $routeParams.district : "All Districts";

        var initializing = true;

        $scope.$watchCollection('searchTerm', function (oldSearchTerm, newSearchTerm) {
            $scope.pagination.page = 1;
            if (initializing) {
                loadItemFeedbackReport();
                initializing = false;
            } else {
                $scope.searching = true;

                if (timer) {
                    $timeout.cancel(timer);
                }

                if (oldSearchTerm.itemDescription != newSearchTerm.itemDescription
                    || oldSearchTerm.poWaybill != newSearchTerm.poWaybill) {
                    startTimer();
                } else {
                    loadItemFeedbackReport();
                }
            }
        });

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm);
        };

        $scope.goToPage = function (page) {
            $scope.pagination.page = page;
            loadItemFeedbackReport()
        };

        $scope.convertToDate = function (dateString) {
            return Date.parse(dateString);
        };

        $scope.sortBy = function (sortField) {
            if (SUPPORTED_FIELD.indexOf(sortField) !== -1) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                loadItemFeedbackReport()
            }
        };

        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        $scope.formatDate = function (date) {
            return SysUtilsService.formatDate(date);
        };

        function startTimer() {
            timer = $timeout(function () {
                loadItemFeedbackReport()
            }, 2000);
        }

        function loadItemFeedbackReport() {
            LoaderService.showLoader();
            var allFilter = angular.extend({}, getLocationTerm(), getSearchTerm(), getSortTerm());
            ReportService.itemFeedbackReport(allFilter, $scope.pagination.page).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;

                updateProgrammes(response.programmeIds);
            }, function () {
                ErrorMessageService.showError();
            }).finally(function () {
                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }

        function updateProgrammes(programmeIds) {
            $scope.displayProgrammes = programmeIds ? $scope.directiveValues.allProgrammes.filter(function (programme) {
                return _.contains(programmeIds, programme.id);
            }) : [];

            $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
        }

        function getLocationTerm() {
            var location = $routeParams.district;
            return location ? {'location': location} : {};
        }

        function getSearchTerm() {
            return $scope.searchTerm;
        }

        function getSortTerm() {
            return $scope.sortTerm;
        }

        $scope.exportToCSV = function () {
            var allFilter = appendLocationFilter($scope.searchTerm);
            ReportService.exportItemFeedbackReport(allFilter).then(function (response) {
                ngToast.create({content: response.message, class: 'info'});
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        }
    });
