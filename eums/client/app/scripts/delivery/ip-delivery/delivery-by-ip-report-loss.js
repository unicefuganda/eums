'use strict';

angular.module('DeliveryByIpReportLoss', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('DeliveryByIpReportLossController', function ($scope, $routeParams, ngToast, $q, ConsigneeItemService,
                                                              LoaderService, DeliveryNodeService, $location) {
        var itemId = $routeParams.itemId;

        $scope.justification = "";
        $scope.save = function () {
            var nodesWithQuantity = $scope.selectedDeliveries.filter(function (deliveryNode) {
                return deliveryNode.quantitySelected > 0;
            });
            var nodesWithLoss = nodesWithQuantity.map(function (deliveryNode) {
                return {
                    id: deliveryNode.id,
                    quantity: deliveryNode.quantitySelected,
                    justification: $scope.justification
                };
            });

            if (nodesWithLoss.length && scopeDataIsValid(nodesWithQuantity)) {
                LoaderService.showLoader();
                DeliveryNodeService.reportLoss(nodesWithLoss).then(function () {
                    createToast('Loss/Damage Successfully Reported', 'success');
                    $location.path('/ip-items');
                }).catch(function () {
                    createToast('Failed to Report Loss/Damage', 'danger');
                }).finally(LoaderService.hideLoader);
            } else {
                createToast('Cannot save. Please fill out or fix values', 'danger');
            }
        };

        $scope.updateSelectedOrderNumber = function (orderNumber) {
            if ($scope.selectedOrderNumber != orderNumber) {
                $scope.selectedOrderNumber = orderNumber;
            } else {
                $scope.selectedOrderNumber = undefined;
            }
        };

        $scope.$watch('selectedDeliveries', function (deliveries) {
            if (deliveries) {
                $scope.totalQuantitySelected = deliveries.reduce(function (acc, delivery) {
                    acc.quantitySelected += delivery.quantitySelected || 0;
                    return acc;
                }, {quantitySelected: 0}).quantitySelected;
            }
        }, true);

        $scope.$watch('selectedOrderNumber', function (selectedOrderNumber) {
            if ($scope.allDeliveries) {
                $scope.selectedDeliveries = $scope.allDeliveries.filter(function (delivery) {
                    return delivery.orderNumber == selectedOrderNumber;
                });
            }
        });

        function init() {
            var promises = [];
            promises.push(ConsigneeItemService.filter({item: itemId}).then(function (response) {
                var item = response.results.first();
                $scope.consigneeItem = {
                    itemId: item.item,
                    itemDescription: item.itemDescription,
                    quantityAvailable: item.availableBalance
                };
            }));
            promises.push(DeliveryNodeService.filter({
                item__item: itemId,
                is_distributable: true
            }).then(function (nodes) {
                $scope.deliveryGroups = [];
                $scope.selectedOrderNumber = "";
                nodes.forEach(function (node) {
                    updateDeliveryGroups(node, nodes);
                });
                $scope.allDeliveries = nodes;
                $scope.selectedDeliveries = $scope.allDeliveries.filter(function (delivery) {
                    return delivery.orderNumber == $scope.deliveryGroups.first().orderNumber;
                });
                $scope.selectedOrderNumber = $scope.deliveryGroups.first().orderNumber;
            }));

            LoaderService.showLoader();
            $q.all(promises).catch(function () {
                createToast('failed to load deliveries', 'danger');
            }).finally(LoaderService.hideLoader);
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
                deliveryGroup.numberOfShipments = getTotalValueFrom(nodes, orderNumber, 'numberOfShipment', function () {
                    return 1;
                });
                deliveryGroup.isOpen = function () {
                    return this.orderNumber == $scope.selectedOrderNumber;
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

        function scopeDataIsValid(parentDeliveries) {
            return allQuantitiesAreValid() && deliveriesAreFromOneOrder(parentDeliveries);
        }

        function allQuantitiesAreValid() {
            return !$scope.selectedDeliveries.any(function (delivery) {
                return delivery.quantitySelected > delivery.balance;
            });
        }

        function deliveriesAreFromOneOrder(parentDeliveries) {
            var parentDeliveryOrderHashes = parentDeliveries.map(function (delivery) {
                return delivery.orderNumber + delivery.orderType;
            });
            return parentDeliveryOrderHashes.unique().length == 1;
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass, maxNumber: 1, dismissOnTimeout: true});
        }

        init();
    });