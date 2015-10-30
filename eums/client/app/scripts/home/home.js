'use strict';

angular.module('Home', ['GlobalStats', 'Delivery', 'DeliveryNode', 'PurchaseOrderItem', 'PurchaseOrder', 'eums.map',
    'Loader', 'map.layers'])
    .controller('HomeController', function ($rootScope, $scope, $location, UserService, MapService, LoaderService) {
        $scope.filter = {programme: '', ip: '', from: '', to: '', year: ''};
        $scope.deliveryStatus = {
            received: true, notDelivered: true, receivedWithIssues: true,
            mapReceivedWithIssues: true, mapNonResponse: true, mapReceived: true,
            mapNotReceived: true
        };

        $scope.datepicker = {from: false, to: false};
        $scope.totalStats = {};
        $scope.allResponses = {};
        $scope.allResponsesFromDb = {};
        $scope.allResponsesMap = [];
        $scope.data = {topLevelResponses: [], allResponsesLocationMap: [], totalStats: {}, responses: [], district: ''};
        $scope.isFiltered = false;
        $scope.notDeliveryStatus = false;
        $scope.ipView = false;
        $scope.deliveryStatusCollapsed = false;

        $scope.directiveValues = {};

        UserService.getCurrentUser().then(function (user) {
            $scope.user = user;
        });
        $scope.showDetailedResponses = function () {
            $location.path('/response-details/' + $scope.data.district);
        };

        $scope.toggleIpView = function (value) {
            $scope.ipView = value;
        };

        $scope.$watch('ipView', function (newIpView, oldIpView) {
            if (newIpView != oldIpView) {
                $scope.redrawMapColors();
            }
        });

        $scope.redrawMapColors = function () {
            LoaderService.showLoader();
            MapService.addHeatMap($scope);
        };

        $scope.$watchCollection('filter', function (newFilter, oldFilter) {
            if (!Object.equal(newFilter, oldFilter)) {
                $scope.redrawMapColors();
            }
        }, true);

        $scope.tmp = {mapReceivedAll: true};

        $scope.updateAllReceived = function() {
            $scope.tmp.mapReceivedAll = ($scope.deliveryStatus.mapReceived && $scope.deliveryStatus.mapReceivedWithIssues);
        };

        $scope.updateReceivedDeliveryStatus = function() {
            if ($scope.tmp.mapReceivedAll) {
                $scope.deliveryStatus.mapReceived = true;
                $scope.deliveryStatus.mapReceivedWithIssues = true;
            }
        };

        $scope.$watchCollection('deliveryStatus', function (newDeliveryStatus, oldDeliveryStatus) {
            if (!Object.equal(newDeliveryStatus, oldDeliveryStatus) && $scope.ipView) {
                $scope.redrawMapColors();
            }
        }, true);
    })
    .controller('ResponseController', function ($scope, $q, $routeParams, DeliveryService, PurchaseOrderService,
                                                DeliveryNodeService, PurchaseOrderItemService) {
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
