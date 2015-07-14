'use strict';

angular.module('IPWarehouseDeliveryManagement', ['ReleaseOrder', 'User', 'DistributionPlanNode', 'Consignee', 'eums.ip', 'Contact',
    'ReleaseOrderItem', 'DatePicker', 'ui.bootstrap', 'ngToast'])
    .controller('IPWarehouseDeliveryManagementController', function ($scope, $routeParams, ReleaseOrderService, UserService, $location,
                                                                     DeliveryNode, $q, ngToast, DistributionPlanNodeService, IPService,
                                                                     ConsigneeService, ReleaseOrderItemService) {
        function showLoader() {
            if (!angular.element('#loading').hasClass('in')) {
                angular.element('#loading').modal();
            }
        }

        function hideLoader() {
            angular.element('#loading').modal('hide');
            angular.element('#loading.modal').removeClass('in');
            angular.element('.modal-backdrop').remove();
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass, maxNumber: 1, dismissOnTimeout: true});
        }

        showLoader();
        var rootPath = '/ip-warehouse-delivery/new/';
        var releaseOrderId = $routeParams.releaseOrderId;
        var releaseOrderItemId = $routeParams.releaseOrderItemId;
        var deliveryNodeId = $routeParams.deliveryNodeId;
        var loadPromises = [];

        $scope.districts = [];
        $scope.consignees = [];
        $scope.deliveryNodes = [];
        
        $scope.state = {
            NODE: deliveryNodeId,
            PO_ITEM: releaseOrderItemId,
            PO_LEVEL: !deliveryNodeId && !releaseOrderItemId && releaseOrderId,
            canGoBack: function () {
                return $scope.parentNode && $scope.parentNode.parent;
            }
        };
        $scope.selectedReleaseOrderItem = $scope.datepicker = {};

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
            var filterParams = {release_order: releaseOrderId, consignee: user.consignee_id};
            return ReleaseOrderItemService.filter(filterParams, ['item.unit']).then(function (orderItems) {
                $scope.releaseOrderItems = orderItems;
            });
        }));

        loadPromises.push(ReleaseOrderService.get(releaseOrderId).then(function (releaseOrder) {
            $scope.selectedReleaseOrder = releaseOrder;
        }));

        if ($scope.state.PO_ITEM) {
            var getItem = ReleaseOrderItemService.get(releaseOrderItemId, ['item.unit']).then(function (releaseOrderItem) {
                $scope.selectedReleaseOrderItem = releaseOrderItem;
                !$scope.state.NODE && loadDeliveryDataFor(releaseOrderItem);
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

        $scope.selectReleaseOrderItem = function (releaseOrderItem) {
            $location.path(rootPath + $routeParams.releaseOrderId + '/' + releaseOrderItem.id);
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
            var path = rootPath + $routeParams.releaseOrderId + '/' + $routeParams.releaseOrderItemId + '/';
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
                item: $scope.selectedReleaseOrderItem,
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

        function loadDeliveryDataFor(releaseOrderItem) {
            var getIpNode = function (nodes) {
                for (var i = 0; i < nodes.length; i++) {
                    if (!nodes[i].parent) {
                        return nodes[i];
                    }
                }
                return null;
            };
            var getNodes = function (user) {
                var filterParams = {item: releaseOrderItem.id};
                if (user.consignee_id) {
                    filterParams.consignee = user.consignee_id;
                }
                return DistributionPlanNodeService.filter(filterParams, ['consignee', 'contact_person_id', 'children']).then(function (nodes) {
                    var node = getIpNode(nodes);
                    if (node) {
                        $scope.toSubConsigneeView(node);
                    }
                    else {
                        $scope.deliveryNodes = nodes;
                    }
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

        $q.all(loadPromises).then(hideLoader);
    });