'use strict';

angular.module('EndUserFeedbackReport', ['eums.config', 'ReportService', 'Loader'])
    .controller('EndUserFeedbackReportController', function ($scope, $q, $location, $timeout, $routeParams,
                                                             ReportService, LoaderService) {
        var timer;

        $scope.district = $routeParams.district ? $routeParams.district : "All Districts";

        $scope.$watch('searchTerm', function () {
            if ($scope.searchTerm && $scope.searchTerm.trim()) {
                $scope.searching = true;
                if (timer) {
                    $timeout.cancel(timer);
                }
                startTimer();
            } else {
                loadEndUserFeedbackReport()
            }
        });

        $scope.goToPage = function (page) {
            loadEndUserFeedbackReport({page: page})
        };

        $scope.convertToDate = function (dateString) {
            return Date.parse(dateString);
        };

        function startTimer() {
            timer = $timeout(function () {
                loadEndUserFeedbackReport({query: $scope.searchTerm})
            }, 1000);
        }

        function appendLocationFilter(filterParams) {
            var location = $routeParams.district;
            if (location) {
                return angular.extend({'location': location}, filterParams);
            }
            return filterParams;
        }

        function loadEndUserFeedbackReport(filterParams) {
            $scope.searching ? LoaderService.hideLoader() : LoaderService.showLoader();
            var allFilter = appendLocationFilter(filterParams);
            ReportService.endUserFeedbackReport(allFilter).then(function (response) {
                $scope.report = response.results;
                $scope.count = response.count;
                $scope.pageSize = response.pageSize;
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