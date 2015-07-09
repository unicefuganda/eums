'use strict';

angular.module('IPDirectDeliveryManagement', ['PurchaseOrder', 'User', 'DistributionPlanNode', 'Consignee', 'eums.ip', 'Contact', 'PurchaseOrderItem', 'DatePicker', 'ui.bootstrap', 'ngToast'])
    .controller('IPDirectDeliveryManagementController', function ($scope, $routeParams, PurchaseOrderService, UserService, $location, DeliveryNode, $q, ngToast,
                                                                  DistributionPlanNodeService, IPService, ConsigneeService, PurchaseOrderItemService) {
        function showLoader() {
            angular.element('#loading').modal();
        }

        function hideLoader() {
            angular.element('#loading').modal('hide');
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass, maxNumber: 1, dismissOnTimeout: true});
        }

        showLoader();
        var rootPath = '/ip-delivery-report/new/';
        var purchaseOrderId = $routeParams.purchaseOrderId;
        var purchaseOrderItemId = $routeParams.purchaseOrderItemId;
        var deliveryNodeId = $routeParams.deliveryNodeId;
        var loadPromises = [];

        $scope.districts = $scope.consignees = $scope.deliveryNodes = [];
        $scope.state = {
            NODE: deliveryNodeId,
            PO_ITEM: purchaseOrderItemId,
            PO_LEVEL: !deliveryNodeId && !purchaseOrderItemId && purchaseOrderId,
            canGoBack: function () {
                return $scope.parentNode && $scope.parentNode.parent;
            }
        };
        $scope.selectedPurchaseOrderItem = $scope.datepicker = {};

        loadPromises.push(IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
        }));

        loadPromises.push(ConsigneeService.all().then(function (consignees) {
            $scope.consignees = consignees;
        }));

        var getUser = UserService.getCurrentUser();

        loadPromises.push(getUser.then(function (user) {
            var filterParams = {purchase_order: purchaseOrderId, consignee: user.consignee_id};
            return PurchaseOrderItemService.filter(filterParams, ['item.unit']).then(function (orderItems) {
                $scope.purchaseOrderItems = orderItems;
            });
        }));

        loadPromises.push(PurchaseOrderService.get(purchaseOrderId).then(function (purchaseOrder) {
            $scope.selectedPurchaseOrder = purchaseOrder;
        }));

        if ($scope.state.PO_ITEM) {
            var getItem = PurchaseOrderItemService.get(purchaseOrderItemId, ['item.unit']).then(function (purchaseOrderItem) {
                $scope.selectedPurchaseOrderItem = purchaseOrderItem;
                !$scope.state.NODE && loadDeliveryDataFor(purchaseOrderItem);
            });
            loadPromises.push(getItem);
        }

        if ($scope.state.NODE) {
            var fields = ['consignee', 'contact_person_id'];
            var getChildNodes = DistributionPlanNodeService.filter({parent: deliveryNodeId}, fields).then(function (childNodes) {
                $scope.deliveryNodes.add(childNodes);
            });
            var getParentNode = DistributionPlanNodeService.get(deliveryNodeId, ['consignee']).then(function (node) {
                $scope.delivery = node.distributionPlan;
                $scope.parentNode = node;
            });
            loadPromises.add([getParentNode, getChildNodes]);
        }


        $scope.selectPurchaseOrderItem = function (purchaseOrderItem) {
            $location.path(rootPath + $routeParams.purchaseOrderId + '/' + purchaseOrderItem.id);
        };

        $scope.addContact = function (node, nodeIndex) {
            $scope.$broadcast('add-contact', node, nodeIndex);
        };

        $scope.$on('contact-saved', function (event, contact, node, nodeIndex) {
            node.contactPerson = {id: contact._id};
            $scope.$broadcast('set-contact-for-node', contact, nodeIndex);
            event.stopPropagation();
        });

        $scope.invalidNodes = function () {
            var someNodesAreInvalid = $scope.deliveryNodes.some(function (node) {
                return node.isInvalid();
            });
            var quantityLeft = $scope.parentNode ? $scope.parentNode.quantityLeft($scope.deliveryNodes) : -1;
            return someNodesAreInvalid || quantityLeft < 0;
        };

        $scope.toSubConsigneeView = function (node) {
            var path = rootPath + $routeParams.purchaseOrderId + '/' + $routeParams.purchaseOrderItemId + '/';
            node.id && $location.path(path + node.id);
            showLoader();
            !node.id && DistributionPlanNodeService.get(node).then(function (fetchedNode) {
                $location.path(path + fetchedNode.id);
            });
        };

        $scope.toOrderView = function (order) {
            $location.path(rootPath + order.id);
        };

        $scope.addDeliveryNode = function () {
            var deliveryNode = new DeliveryNode({
                parent: deliveryNodeId,
                item: $scope.selectedPurchaseOrderItem,
                distributionPlan: $scope.delivery
            });
            $scope.deliveryNodes.push(deliveryNode);
        };

        $scope.saveDeliveryNodes = function (nodes) {
            showLoader();
            var savePromises = [];
            nodes.forEach(function (node) {
                node.id && savePromises.push(DistributionPlanNodeService.update(node));
                !node.id && savePromises.push(DistributionPlanNodeService.create(node).then(function (created) {
                    node.id = created.id;
                }));
            });
            $q.all(savePromises).then(function () {
                createToast('Report Saved!', 'success');
            }).catch(function () {
                createToast('Report not saved!', 'danger');
            }).finally(hideLoader);
        };

        function loadDeliveryDataFor(purchaseOrderItem) {
            var getIpNodes = function (nodes) {
                var ipNodes = [];
                for (var i = 0; i < nodes.length; i++) {
                    if (!nodes[i].parent) {
                        ipNodes.push(nodes[i]);
                    }
                }
                return ipNodes;
            };
            var getNodes = function (user) {
                var filterParams = {item: purchaseOrderItem.id};
                if (user.consignee_id) {
                    filterParams.consignee = user.consignee_id;
                }
                return DistributionPlanNodeService.filter(filterParams, ['consignee', 'contact_person_id', 'children']).then(function (nodes) {
                    var ipNodes = getIpNodes(nodes);
                    $scope.deliveryNodes = ipNodes;
                });
            };

            getUser.then(getNodes);
            loadPromises.add([getUser, getNodes]);
        }

        $scope.getTotalQuantity = function () {
            if (!$scope.parentNode) {
                return $scope.deliveryNodes ? $scope.deliveryNodes.sum(function (node) {
                    return parseInt(node.targetedQuantity);
                }) : '';
            }
            else {
                return $scope.parentNode.targetedQuantity;
            }
        };

        $scope.computeQuantityLeft = function computeQuantityLeft(parentNode, deliveryNodes) {
            var reduced = deliveryNodes.reduce(function (previous, current) {
                return {targetedQuantity: isNaN(current.targetedQuantity) ? previous.targetedQuantity : (previous.targetedQuantity + current.targetedQuantity)};
            }, {targetedQuantity: 0});

            return parentNode.targetedQuantity - reduced.targetedQuantity;
        };


        $q.all(loadPromises).then(hideLoader);
    });