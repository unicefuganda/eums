'use strict';

angular.module('Home', ['GlobalStats', 'DistributionPlan', 'DistributionPlanNode', 'SalesOrderItem'])
    .controller('HomeController', function ($rootScope, $scope, $location, UserService) {
        $scope.filter = {programme: '', ip: '', year: ''};
        $scope.deliveryStatus = {received: true, notDelivered: true, receivedWithIssues: true};

        $scope.datepicker = {from: false, to: false};
        $scope.dateFilter = {from: '', to: ''};
        $scope.totalStats = {};
        $scope.allResponses = {};
        $scope.allResponsesFromDb = {};
        $scope.allResponsesMap = [];
        $scope.data = {topLevelResponses: [], allResponsesLocationMap: [], totalStats: {}, responses: [], district: ''};
        $scope.isFiltered = false;
        $scope.notDeliveryStatus = false;

        UserService.getCurrentUser().then(function (user) {
            $scope.user = user;
        });
        $scope.showDetailedResponses = function () {
            $location.path('/response-details/' + $scope.data.district);
        };

    }).controller('ResponseController', function ($scope, $q, $routeParams, DistributionPlanService, DistributionPlanNodeService, SalesOrderItemService) {
        function getAllResponsesByDate() {
            return DistributionPlanService.orderAllResponsesByDate($routeParams.district).then(function (allResponses) {
                var nodePromises = [];
                var poItemPromises = [];

                allResponses.forEach(function (response) {
                    if (response.node) {
                        nodePromises.push(
                            DistributionPlanNodeService.getPlanNodeDetails(response.node).then(function (planNode) {
                                response.contact_person = planNode.contact_person;


                                var sales_order_item_id = planNode.item;
                                poItemPromises.push(
                                    SalesOrderItemService.getPOItemforSOItem(sales_order_item_id).then(function (poItem) {
                                        response.purchase_order = poItem.purchase_order;
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

        getAllResponsesByDate().then(function (allResponses) {
            $scope.allResponses = allResponses;
        });
    })
    .directive('customPopover', function () {
        return {
            restrict: 'A',
            link: function (scope, el, attrs) {
                $(el).popover({
                    trigger: 'hover',
                    html: true,
                    content: attrs.popoverHtml
                });
            }
        };
    });
