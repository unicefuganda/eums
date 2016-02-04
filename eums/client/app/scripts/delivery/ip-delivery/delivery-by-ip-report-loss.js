'use strict';

angular.module('DeliveryByIpReportLoss', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('DeliveryByIpReportLossController', function ($scope, $routeParams, ngToast, $q, ConsigneeItemService, DeliveryNodeService) {
        var itemId = $routeParams.itemId;

        $scope.save = function () {
            var nodesWithQuantity = $scope.selectedDeliveries.filter(function (deliveryNode) {
               return deliveryNode.quantitySelected > 0;
            });
            var nodesWithLoss = nodesWithQuantity.map(function (deliveryNode) {
                return {id: deliveryNode.id, quantity: deliveryNode.quantitySelected};
            });

            // Show loader

            DeliveryNodeService.reportLoss(nodesWithLoss).then(function (responses) {
                console.log('success');
                // Hide loader
                // Show toast
            });
        };

        $scope.$watch('selectedDeliveries', function (deliveries) {
            if (deliveries) {
                $scope.totalQuantitySelected = deliveries.reduce(function (acc, delivery) {
                    acc.quantitySelected += delivery.quantitySelected || 0;
                    return acc;
                }, {quantitySelected: 0}).quantitySelected;
            }
        }, true);

        function init() {
            ConsigneeItemService.filter({item: itemId}).then(function (response) {
                var item = response.results.first();
                $scope.consigneeItem = {
                    itemId: item.item,
                    itemDescription: item.itemDescription,
                    quantityAvailable: item.availableBalance
                };
            });

            DeliveryNodeService.filter({item__item: itemId, is_distributable: true}).then(function (nodes) {
                $scope.deliveryGroups = [];
                //$scope.selectedOrderNumber = "";
                nodes.forEach(function (node) {
                    updateDeliveryGroups(node, nodes);
                });
                $scope.allDeliveries = nodes;
                $scope.selectedDeliveries = $scope.allDeliveries.filter(function (delivery) {
                    return delivery.orderNumber == $scope.deliveryGroups.first().orderNumber;
                });
                //$scope.selectedOrderNumber = $scope.deliveryGroups.first().orderNumber;
            });

        }

        function updateDeliveryGroups(node, nodes) {
            var orderNumber = node.orderNumber;
            var deliveryGroups = $scope.deliveryGroups.filter(function (deliveryGroup) {
                return deliveryGroup.orderNumber == orderNumber;
            });
            if (deliveryGroups.length == 0) {
                var deliveryGroup = {orderNumber: orderNumber};
                deliveryGroup.totalQuantity = getTotalValueFrom(nodes, orderNumber, 'balance', function (balance) {
                    return balance || 0;
                });
                deliveryGroup.numberOfShipments = getTotalValueFrom(nodes, orderNumber, 'numberOfShipment', function (balance) {
                    return 1;
                });
                deliveryGroup.isOpen = function () {
                    return true;
                    //return this.orderNumber == $scope.selectedOrderNumber;
                };
                $scope.deliveryGroups.push(deliveryGroup);
            }
        }

        function getTotalValueFrom(nodes, orderNumber, key, rule) {
            return nodes.reduce(function (acc, delivery) {
                if (delivery.orderNumber == orderNumber) {
                    acc += rule(delivery[key]);
                }
                return acc;
            }, 0);
        }

        init();
    });