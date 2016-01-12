'use strict';

angular.module('ItemFeedbackReport', ['eums.config', 'ReportService', 'Loader', 'Contact', 'EumsErrorMessage', 'Option', 'Sort', 'SortArrow', 'SysUtils', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('ItemFeedbackReportController', function ($scope, $q, $location, $timeout, $routeParams,
                                                          ReportService, LoaderService, ErrorMessageService, SortService,
                                                          ContactService, SortArrowService, SysUtilsService, ngToast) {
        
        var SUPPORTED_FIELD = ['quantity_shipped', 'value', 'dateOfReceipt', 'amountReceived'];
        var timer;
        var initializing = true;

        $scope.searchTerm = {};
        $scope.sortTerm = {field: 'dateOfReceipt', order: 'desc'};
        $scope.directiveValues = {};
        $scope.pagination = {page: 1};
        $scope.district = $routeParams.district ? $routeParams.district : "All Districts";

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

                if (oldSearchTerm.itemDescription != newSearchTerm.itemDescription ||
                    oldSearchTerm.poWaybill != newSearchTerm.poWaybill) {
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
                $scope.goToPage(1);
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

        $scope.exportToCSV = function () {
            var allFilters = angular.extend({}, getLocationTerm(), getSearchTerm());
            ReportService.exportItemFeedbackReport(allFilters).then(function (response) {
                ngToast.create({content: response.message, class: 'info'});
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        }

        function startTimer() {
            timer = $timeout(function () {
                loadItemFeedbackReport()
            }, 2000);
        }

        function loadItemFeedbackReport() {
            LoaderService.showLoader();
            var allFilters = angular.extend({}, getLocationTerm(), getSearchTerm(), getSortTerm());
            ReportService.itemFeedbackReport(allFilters, $scope.pagination.page).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
                setContactToReports($scope.report)
                updateProgrammes(response.programmeIds);
            }, function () {
                ErrorMessageService.showError();
            }).finally(function () {
                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }

        function setContactToReports(reports) {
            reports.forEach(function (report) {
                loadContact(report.contact_person_id, function (contact) {
                    report.contactName = contact.firstName + ' ' + contact.lastName;
                    report.contactPhone = contact.phone;
                });
            });
        }

        function loadContact(contactId, callback) {
            if (contactId == null) {
                return;
            }
            ContactService.get(contactId).then(function (contact) {
                var result = contact != null ? contact : {firstName: "", lastName: "", phone: ""};
                callback(result);
            });
        }

        function updateProgrammes(programmeIds) {
            $scope.displayProgrammes = programmeIds ? $scope.directiveValues.allProgrammes.filter(function (programme) {
                return _.contains(programmeIds, programme.id);
            }) : [];

            if (!_.isEmpty($scope.displayProgrammes)) {
                $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
            }
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
    });
