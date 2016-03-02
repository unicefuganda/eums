'use strict';

angular.module('ItemFeedbackReport', ['eums.config', 'ReportService', 'Loader', 'Contact', 'EumsErrorMessage', 'Option',
        'Sort', 'SortArrow', 'SysUtils', 'ngToast', 'SystemSettingsService', 'Answer', 'ui.bootstrap'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('ItemFeedbackReportController', function ($scope, $q, $location, $timeout, $routeParams, ngToast,
                                                          ReportService, LoaderService, ErrorMessageService, SortService,
                                                          ContactService, SortArrowService, SysUtilsService,
                                                          SystemSettingsService, AnswerService, UserService) {

        var SUPPORTED_FIELD = ['quantity_shipped', 'value', 'mergedDateOfReceipt', 'answers.amountReceived.value'];
        var timer;
        var initializing = true;

        $scope.searchTerm = $routeParams.district ? {selectedLocation: SysUtilsService.capitalize($routeParams.district)} : {};
        $scope.sortTerm = {field: 'mergedDateOfReceipt', order: 'desc'};
        $scope.directiveValues = {};
        $scope.pagination = {page: 1};
        $scope.editingAmountReceivedObj = {};

        // todo: use '_.throttle' instead of the timer
        $scope.$watchCollection('searchTerm', function (oldSearchTerm, newSearchTerm) {
            $scope.pagination.page = 1;
            if (initializing) {
                init();
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

        $scope.sortBy = function (sortField) {
            if (SUPPORTED_FIELD.indexOf(sortField) !== -1) {
                $scope.sortTerm = SortService.sortBy(sortField, $scope.sortTerm);
                $scope.goToPage(1);
            }
        };

        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        $scope.showStockAdjustmentDialog = function (amountReceivedObj) {
            if (!angular.equals(amountReceivedObj, $scope.editingAmountReceivedObj)) {
                angular.copy(amountReceivedObj, $scope.editingAmountReceivedObj);
            }
            LoaderService.showModal('stock-adjustment-modal-dialog')
        };

        $scope.saveStockAdjustment = function (amountReceivedObj) {
            if (!amountReceivedObj || !amountReceivedObj.id || !amountReceivedObj.remark) {
                return;
            }

            amountReceivedObj.value = amountReceivedObj.value ? amountReceivedObj.value : 0;
            var updatedValue = {
                value: amountReceivedObj.value,
                remark: amountReceivedObj.remark ? amountReceivedObj.remark : ''
            };
            AnswerService.updateNumericAnswer(amountReceivedObj.id, updatedValue).then(function () {
                $scope.report.forEach(function (item) {
                    if (item.answers &&
                        item.answers.amountReceived &&
                        item.answers.amountReceived.id === amountReceivedObj.id) {
                        if (!angular.equals(amountReceivedObj, item.answers.amountReceived)) {
                            angular.copy(amountReceivedObj, item.answers.amountReceived);
                        }
                    }
                });
                $scope.editingAmountReceivedObj = {};
                ngToast.create({content: 'Quantity updated successfully', class: 'success'});
            }).catch(function () {
                ngToast.create({content: 'Operation failed', class: 'danger'})
            });
        };

        $scope.isAmountReceivedEditable = function (amountReceivedObj) {
            if (amountReceivedObj) {
                return !isNaN(amountReceivedObj.value);
            }
            return amountReceivedObj;
        };

        $scope.isAmountReceivedEverChanged = function (amountReceivedObj) {
            if (amountReceivedObj) {
                return !isNaN(amountReceivedObj.value) && amountReceivedObj.remark;
            }
            return amountReceivedObj;
        };

        $scope.formatDate = function (date) {
            return SysUtilsService.formatDate(date);
        };

        $scope.exportToCSV = function () {
            var allFilters = angular.extend({}, getSearchTerm());
            ReportService.exportItemFeedbackReport(allFilters).then(function (response) {
                ngToast.create({content: response.message, class: 'info'});
            }, function () {
                var errorMessage = "Error while generating CSV. Please contact the system's admin.";
                ngToast.create({content: errorMessage, class: 'danger'})
            });
        };

        $scope.showAdditionalRemarks = function (msg) {
            $scope.additional_remarks = msg;
            LoaderService.showModal("additional-remarks-modal-dialog");
        };

        function init() {
            var promises = [];
            promises.push(loadUserPermissions());
            promises.push(SystemSettingsService.getSettingsWithDefault());
            $q.all(promises).then(function (returns) {
                $scope.systemSettings = returns[1];
            });
        }

        function loadUserPermissions() {
            return UserService.retrieveUserPermissions().then(function (permissions) {
                $scope.userPermissions = permissions;
                UserService.hasPermission("eums.change_numericanswer", $scope.userPermissions).then(function (result) {
                    $scope.can_change = result;
                });
            });
        }

        function startTimer() {
            timer = $timeout(function () {
                loadItemFeedbackReport()
            }, 2000);
        }

        function loadItemFeedbackReport() {
            LoaderService.showLoader();
            var allFilters = angular.extend({}, getSearchTerm(), getSortTerm());
            ReportService.itemFeedbackReport(allFilters, $scope.pagination.page).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
                setContactToReports($scope.report);
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
            SysUtilsService.whenAvailable(function () {
                return $scope.directiveValues.allProgrammes;
            }, function () {
                $scope.displayProgrammes = programmeIds ? $scope.directiveValues.allProgrammes.filter(function (programme) {
                    return _.contains(programmeIds, programme.id);
                }) : [];

                if (!_.isEmpty($scope.displayProgrammes)) {
                    $scope.populateProgrammesSelect2 && $scope.populateProgrammesSelect2($scope.displayProgrammes);
                }
            });
        }

        function getSearchTerm() {
            var filters = _($scope.searchTerm).omit(_.isUndefined).omit(_.isNull).value();
            if (filters.status) {
                filters.status = processStatusValue(filters.status)
            }
            return filters;
        }

        function processStatusValue(status) {
            var statusValue = {
                "Complete": "completed",
                "Incomplete": "expired,scheduled"
            }
            return statusValue[status];
        }

        function getSortTerm() {
            return $scope.sortTerm;
        }
    });
