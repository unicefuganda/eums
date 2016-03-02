'use strict';

angular.module('Home', ['GlobalStats', 'Delivery', 'DeliveryNode', 'PurchaseOrderItem', 'PurchaseOrder', 'eums.map',
        'Loader', 'map.layers', 'SystemSettingsService'])
    .controller('HomeController', function ($rootScope, $scope, $q, $location, UserService, MapService, LoaderService,
                                            SystemSettingsService) {
        $scope.filter = {programme: '', ip: '', from: '', to: ''};
        $scope.deliveryStatus = {
            mapReceivedWithIssues: true,
            mapNonResponse: true,
            mapReceived: true,
            mapNotReceived: true
        };
        $scope.datepicker = {from: false, to: false};
        $scope.data = {totalStats: {}, district: '', ipView: false};
        $scope.deliveryStatusCollapsed = false;
        $scope.directiveValues = {};
        $scope.tmp = {mapReceivedAll: true};

        init();

        $scope.$watchCollection('deliveryStatus', function (newDeliveryStatus, oldDeliveryStatus) {
            if (!Object.equal(newDeliveryStatus, oldDeliveryStatus)) {
                redrawMapColors();
            }
        }, true);

        $scope.showDetailedResponses = function () {
            var item_url = '/item-feedback-report/';
            var ip_url = '/ip-feedback-report-by-delivery/';
            var url = $scope.data.ipView ? ip_url : item_url;
            $location.path(url + $scope.data.district);
        };

        $scope.toggleIpView = function (value) {
            $scope.data.ipView = value;
            redrawMapColors();
        };

        $scope.$watchCollection('filter', function (newFilter, oldFilter) {
            if (!Object.equal(newFilter, oldFilter)) {
                redrawMapColors();
            }
        }, true);

        $scope.updateAllReceived = function () {
            $scope.tmp.mapReceivedAll = ($scope.deliveryStatus.mapReceived && $scope.deliveryStatus.mapReceivedWithIssues);
        };

        $scope.updateReceivedDeliveryStatus = function () {
            $scope.deliveryStatus.mapReceived = $scope.tmp.mapReceivedAll;
            $scope.deliveryStatus.mapReceivedWithIssues = $scope.tmp.mapReceivedAll;
        };

        function init() {
            LoaderService.showLoader();
            var promises = [];
            promises.push(SystemSettingsService.getSettingsWithDefault());
            $q.all(promises).then(function (returns) {
                $scope.systemSettings = returns[0];
                LoaderService.hideLoader();
            });
        }

        var redrawMapColors = function () {
            LoaderService.showLoader();
            MapService.addHeatMap($scope);
            $scope.data.district && MapService.clickLayer($scope.data.district);
        };
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
