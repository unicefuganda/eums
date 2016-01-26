'use strict';

angular.module('IpFeedbackReportByDelivery', ['eums.config', 'ReportService', 'Contact', 'Loader', 'EumsErrorMessage', 'Sort', 'SortArrow', 'SysUtils', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('IpFeedbackReportByDeliveryController', function ($scope, $q, $timeout, $routeParams, ReportService, LoaderService, ContactService,
                                                                  ErrorMessageService, SortService, SortArrowService, SysUtilsService, ngToast) {
        var SUPPORTED_FIELD = ['shipmentDate', 'dateOfReceipt', 'value'];
        var timer;
        var initializing = true;

        $scope.searchTerm = {};
        $scope.directiveValues = {};
        $scope.pagination = {page: 1};
        $scope.sortTerm = {field: 'shipmentDate', order: 'desc'};

        $scope.$watchCollection('searchTerm', function () {
            $scope.pagination.page = 1;
            if (initializing) {
                loadIpFeedbackReportByDelivery();
                initializing = false;
            } else {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }
                if ($scope.searchTerm.poWaybill) {
                    startTimer();
                } else {
                    loadIpFeedbackReportByDelivery();
                }
            }
        });

        $scope.sortBy = function (sortField) {
            if (SUPPORTED_FIELD.indexOf(sortField) !== -1) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                $scope.goToPage(1);
                loadIpFeedbackReportByDelivery()
            }
        };

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortTerm)
        };

        $scope.goToPage = function (page) {
            $scope.pagination.page = page;
            loadIpFeedbackReportByDelivery()
        };

        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        $scope.formatDate = function (date) {
            return SysUtilsService.formatDate(date)
        };

        $scope.exportToCSV = function () {
            var allFilters = angular.extend({}, getSearchTerm());
            ReportService.exportDeliveriesFeedbackReport(allFilters).then(function (response) {
                ngToast.create({content: response.message, class: 'info'});
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        };

        function startTimer() {
            timer = $timeout(function () {
                loadIpFeedbackReportByDelivery();
            }, 2000);
        }

        function loadIpFeedbackReportByDelivery() {
            LoaderService.showLoader();
            var allFilters = angular.extend({}, getSearchTerm(), getSortTerm());
            ReportService.ipFeedbackReportByDelivery(allFilters, $scope.pagination.page).then(function (response) {
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
                loadContact(report.contactPersonId, function (contact) {
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

        function getSearchTerm() {
            var filters = _($scope.searchTerm).omit(_.isUndefined).omit(_.isNull).value();
            return filters;
        }

        function getSortTerm() {
            return $scope.sortTerm;
        }
    });
