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

angular.module('NewIpReport', ['PurchaseOrder', 'User', 'DistributionPlanNode', 'Consignee', 'eums.ip', 'Contact', 'PurchaseOrderItem', 'DatePicker', 'ui.bootstrap', 'ngToast'])
    .controller('NewIpDeliveryController', function ($scope, $routeParams, PurchaseOrderService, UserService, $location, DeliveryNode, $q, ngToast,
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
                loadDeliveryDataFor(purchaseOrderItem);
            });
            loadPromises.push(getItem);
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
            var getNodes = function (user) {
                var filterParams = {item: purchaseOrderItem.id};
                if (user.consignee_id) {
                    filterParams.consignee = user.consignee_id
                }
                return DistributionPlanNodeService.filter(filterParams, ['consignee', 'contact_person_id', 'children']).then(function (nodes) {
                    $scope.deliveryNodes = nodes;
                });
            };

            var getParentNode = function (user) {
                var filterParams = {consignee: user.consignee_id, item: purchaseOrderItem.id};
                return DistributionPlanNodeService.filter(filterParams, ['consignee']).then(function (nodes) {
                    var ipDeliveryNode = nodes.first();
                    deliveryNodeId = ipDeliveryNode.id;
                    $scope.delivery = ipDeliveryNode.distributionPlan;
                    $scope.parentNode = ipDeliveryNode;
                    return ipDeliveryNode;
                });
            };
            var getChildNodes = function (parentNode) {
                var fieldsToBuild = ['consignee', 'contact_person_id'];
                DistributionPlanNodeService.filter({parent: parentNode.id}, fieldsToBuild).then(function (children) {
                    $scope.deliveryNodes.add(children);
                });
            };
            getUser.then(getNodes);
            loadPromises.add([getUser, getNodes]);
        }

        $scope.getTotalQuantity = function () {
            return $scope.deliveryNodes.sum(function (node) {
                return parseInt(node.targetedQuantity);
            });
        }

        $q.all(loadPromises).then(hideLoader);
    })
;