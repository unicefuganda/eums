'use strict';

angular.module('ItemFeedbackReport', ['eums.config', 'ReportService', 'Loader', 'EumsErrorMessage', 'Option', 'Sort', 'SortArrow'])
    .controller('ItemFeedbackReportController', function ($scope, $q, $location, $timeout, $routeParams,
                                                          ReportService, LoaderService, ErrorMessageService, OptionService, SortService, SortArrowService) {
        var timer,
            SUPPORTED_FIELD = ['quantity_shipped', 'value', 'dateOfReceipt', 'amountReceived'];
        $scope.searchTerm = {};
        $scope.directiveValues = {};
        $scope.pagination = {page: 1};
        $scope.sortOptions = {};

        $scope.district = $routeParams.district ? $routeParams.district : "All Districts";

        var initializing = true;

        $scope.$watchCollection('searchTerm', function (oldSearchTerm, newSearchTerm) {
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
                    loadItemFeedbackReport($scope.searchTerm);
                }
            }
        });

        $scope.sortArrowClass = function (criteria) {
            return SortArrowService.setSortArrow(criteria, $scope.sortOptions);
        };

        $scope.goToPage = function (page) {
            $scope.pagination.page = page;
            loadItemFeedbackReport($scope.searchTerm)
        };

        $scope.convertToDate = function (dateString) {
            return Date.parse(dateString);
        };

        $scope.sortBy = function (sortField) {
                if(SUPPORTED_FIELD.indexOf(sortField) !== -1) {
                    $scope.sortOptions = SortService.sortBy(sortField);
                    loadItemFeedbackReport()
                }
            };

        function startTimer() {
            $scope.pagination.page = 1;
            timer = $timeout(function () {
                loadItemFeedbackReport($scope.searchTerm)
            }, 2000);
        }

        function appendLocationFilter(filterParams) {
            var location = $routeParams.district;
            if (location) {
                return angular.extend({'location': location}, filterParams);
            }
            return filterParams;
        }

        function loadItemFeedbackReport(filterParams) {
            LoaderService.showLoader();
            var allFilter = appendLocationFilter(filterParams);
            allFilter = angular.extend($scope.sortOptions, allFilter);
            ReportService.itemFeedbackReport(allFilter, $scope.pagination.page).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
            }, function () {
                ErrorMessageService.showError();
            }).finally(function () {
                LoaderService.hideLoader();
                $scope.searching = false;
            });
        }

        $scope.showRemarks = function (index) {
            var remarksModalId = 'remarks-modal-' + index;
            LoaderService.showModal(remarksModalId)
        };

        function getAllResponsesByDate() {
            return DeliveryService.orderAllResponsesByDate($routeParams.district).then(function (allResponses) {
                var nodePromises = [];
                var poItemPromises = [];

                allResponses.forEach(function (response) {
                    if (response.node) {
                        nodePromises.push(
                            DeliveryNodeService.get(response.node, ['contact_person_id']).then(function (planNode) {
                                response.contactPerson = planNode.contactPerson;
                                var purchaseOrderItemId = planNode.item;
                                poItemPromises.push(
                                    PurchaseOrderItemService.get(purchaseOrderItemId).then(function (purchaseOrderItem) {
                                        return PurchaseOrderService.get(purchaseOrderItem.purchaseOrder).then(function (order) {
                                            response.purchaseOrder = order;
                                        });
                                    })
                                );
                            })
                        );
                    }
                });

                return $q.all(nodePromises).then(function () {
                    return $q.all(poItemPromises).then(function () {
                        return allResponses;
                    });
                });

            });
        }
    });