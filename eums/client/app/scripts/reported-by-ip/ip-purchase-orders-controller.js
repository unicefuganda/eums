'use strict';

angular.module('ReportedByIP', ['ngTable', 'siTable', 'PurchaseOrder', 'User', 'Directives', 'DatePicker'])
    .controller('IPPurchaseOrdersController', function ($scope, $location, PurchaseOrderService, UserService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.purchaseOrders = [];

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('orderNumber');
            this.sort.descending = false;

            UserService.getCurrentUser().then(function (user) {
                PurchaseOrderService.forUser(user).then(function (purchaseOrders) {
                    $scope.purchaseOrders = purchaseOrders.sort();
                    angular.element('#loading').modal('hide');
                });
            });
        };

        $scope.sortArrowClass = function (criteria) {
            var output = '';
            if (this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if (this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.selectPurchaseOrder = function (selectedPurchaseOrder) {
            $location.path('/ip-delivery-report/new/' + selectedPurchaseOrder.id);
        };
    });

angular.module('NewIpReport', ['PurchaseOrder', 'User', 'DistributionPlanNode', 'Consignee', 'eums.ip', 'Contact', 'PurchaseOrderItem', 'DatePicker', 'ui.bootstrap'])
    .controller('NewIpDeliveryController', function ($scope, $routeParams, PurchaseOrderService, UserService, $location, DeliveryNode, $q,
                                                     DistributionPlanNodeService, IPService, ConsigneeService, PurchaseOrderItemService) {
        $scope.districts = $scope.consignees = $scope.deliveryNodes = [];
        $scope.selectedPurchaseOrderItem = $scope.datepicker = {};
        var rootPath = '/ip-delivery-report/new/';
        var deliveryNodeId = $routeParams.deliveryNodeId;
        var purchaseOrderItemId = $routeParams.purchaseOrderItemId;

        var state = {
            NODE: deliveryNodeId,
            PO_ITEM: purchaseOrderItemId
        };

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
        });

        ConsigneeService.all().then(function (consignees) {
            $scope.consignees = consignees;
        });

        var fieldsToBuild = ['purchaseorderitem_set.item.unit'];
        PurchaseOrderService.get($routeParams.purchaseOrderId, fieldsToBuild).then(function (purchaseOrder) {
            $scope.selectedPurchaseOrder = purchaseOrder;
            $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
        });

        $scope.selectPurchaseOrderItem = function (purchaseOrderItem) {
            $location.path(rootPath + $routeParams.purchaseOrderId + '/' + purchaseOrderItem.id);
        };

        state.PO_ITEM && PurchaseOrderItemService.get(purchaseOrderItemId, ['item.unit']).then(function (purchaseOrderItem) {
            $scope.selectedPurchaseOrderItem = purchaseOrderItem;
            !state.NODE && loadDeliveryDataFor(purchaseOrderItem);
        });

        var filterParams = {parent: deliveryNodeId};
        state.NODE && DistributionPlanNodeService.filter(filterParams, ['children']).then(function (childNodes) {
            $scope.deliveryNodes.add(childNodes);
        });

        $scope.addContact = function (node, nodeIndex) {
            $scope.$broadcast('add-contact', node, nodeIndex);
        };

        $scope.$on('contact-saved', function (event, contact, node, nodeIndex) {
            node.contactPerson = {id: contact._id};
            $scope.$broadcast('set-contact-for-node', contact, nodeIndex);
            event.stopPropagation();
        });

        $scope.toSubConsigneeView = function (node) {
            var path = rootPath + $routeParams.purchaseOrderId + '/' + $routeParams.purchaseOrderItemId + '/' + node.id;
            $location.path(path)
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
            nodes.forEach(function (node) {
                !node.id && DistributionPlanNodeService.create(node).then(function (created) {
                    node = created;
                });
                node.id && DistributionPlanNodeService.update(node);
            });
        };

        function loadDeliveryDataFor(purchaseOrderItem) {
            var getUser = UserService.getCurrentUser();
            var getParentNode = function (user) {
                var filterParams = {consignee: user.consignee_id, item: purchaseOrderItem.id};
                return DistributionPlanNodeService.filter(filterParams).then(function (nodes) {
                    var ipDeliveryNode = nodes.first();
                    deliveryNodeId = ipDeliveryNode.id;
                    $scope.delivery = ipDeliveryNode.distributionPlan;
                    return ipDeliveryNode;
                });
            };
            var getChildNodes = function (parentNode) {
                var fieldsToBuild = ['consignee', 'contact_person_id'];
                DistributionPlanNodeService.filter({parent: parentNode.id}, fieldsToBuild).then(function (children) {
                    $scope.deliveryNodes.add(children);
                });
            };

            getUser.then(getParentNode).then(getChildNodes);
        }
    });