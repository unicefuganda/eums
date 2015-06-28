'use strict';


angular.module('DirectDeliveryManagement', ['eums.config', 'eums.ip', 'PurchaseOrderItem', 'DistributionPlanNode', 'User', 'Consignee', 'ngTable', 'ngToast', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives', 'Contact', 'Item'])
    .controller('DirectDeliveryManagementController', function ($scope, $location, $q, IPService, UserService, PurchaseOrderItemService, ConsigneeService, DistributionPlanService, DistributionPlanNodeService, ProgrammeService, PurchaseOrderService, $routeParams, ngToast, ItemService) {

        function showLoadingModal(show) {
            if (show && !angular.element('#loading').hasClass('in')) {
                angular.element('#loading').modal();
            }
            else if (!show) {
                angular.element('#loading').modal('hide');
                angular.element('#loading.modal').removeClass('in');
            }
        }

        showLoadingModal(true);

        $scope.datepicker = {};
        $scope.districts = [];
        $scope.consigneeButtonText = 'Add Consignee';
        $scope.contact = {};
        $scope.lineItem = {};
        $scope.itemIndex = '';
        $scope.track = false;
        $scope.consigneeLevel = false;
        $scope.isReport = false;

        $scope.distributionPlanReport = $location.path().substr(1, 15) !== 'delivery-report';
        $scope.quantityHeaderText = $scope.distributionPlanReport ? 'Targeted Qty' : 'Delivered Qty';
        $scope.deliveryDateHeaderText = $scope.distributionPlanReport ? 'Delivery Date' : 'Date Delivered';

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }


        $scope.addContact = function (node, nodeIndex) {
            $scope.$broadcast('add-contact', node, nodeIndex);
        };

        $scope.$on('contact-saved', function (event, contact, node, nodeIndex) {
            node.contactPerson = {id: contact._id};
            $scope.$broadcast('set-contact-for-node', contact, nodeIndex);
            event.stopPropagation();
        });

        $scope.addRemark = function (itemIndex, lineItem) {
            $scope.$parent.itemIndex = itemIndex;
            $scope.$parent.lineItem = lineItem;
            $('#add-remark-modal').modal();
        };

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
        });

        ConsigneeService.all().then(function (consignees) {
            $scope.consignees = consignees;
        });

        $scope.distributionPlanNodes = [];
        $scope.purchaseOrderItems = [];
        function computeQuantityLeft() {
            var reduced = $scope.distributionPlanNodes.reduce(function (previous, current) {
                return {targetedQuantity: isNaN(current.targetedQuantity) ? previous.targetedQuantity : (previous.targetedQuantity + current.targetedQuantity)};
            }, {targetedQuantity: 0});

            return $scope.totalQuantity - reduced.targetedQuantity;
        }

        function updateIpMode(purchaseOrder) {
            if (purchaseOrder.isSingleIp === null) {
                $scope.inSingleIpMode = false;
                $scope.inMultipleIpMode = false;
            } else {
                if (purchaseOrder.isSingleIp) {
                    $scope.inSingleIpMode = true;
                    $scope.inMultipleIpMode = false;
                    $scope.showSingleIpMode();
                } else {
                    $scope.inSingleIpMode = false;
                    $scope.inMultipleIpMode = true;
                    $scope.showMultipleIpMode();
                }
            }
        }


        PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set']).then(function (purchaseOrder) {
            $scope.selectedPurchaseOrder = purchaseOrder;

            updateIpMode(purchaseOrder);

            $scope.selectedPurchaseOrder.purchaseorderitemSet.forEach(function (purchaseOrderItem) {
                ItemService.get(purchaseOrderItem.item, ['unit']).then(function (item) {
                    var formattedPurchaseOrderItem = {
                        display: item.description,
                        materialCode: item.materialCode,
                        quantity: purchaseOrderItem.quantity,
                        unit: item.unit.name,
                        information: purchaseOrderItem
                    };
                    $scope.quantityLeft = computeQuantityLeft();

                    if (formattedPurchaseOrderItem.information.id === Number($routeParams.purchaseOrderItemId) && !$routeParams.distributionPlanNodeId) {
                        $scope.selectedPurchaseOrderItem = formattedPurchaseOrderItem;
                        $scope.selectPurchaseOrderItem();
                    }

                    $scope.purchaseOrderItems.push(formattedPurchaseOrderItem);
                });
            });
        });

        if ($routeParams.distributionPlanNodeId) {
            $scope.consigneeButtonText = 'Add Sub-Consignee';

            DistributionPlanNodeService.getPlanNodeDetails($routeParams.distributionPlanNodeId).then(function (planNode) {
                $scope.planNode = planNode;
                $scope.totalQuantity = planNode.targetedQuantity;

                UserService.getCurrentUser().then(function (user) {
                    $scope.user = user;
                    if ($scope.user.consignee_id) {
                        $scope.consigneeLevel = $scope.planNode.parent ? false : true;
                    }

                    $scope.distributionPlan = planNode.distributionPlan;
                    $scope.track = planNode.track;

                    PurchaseOrderItemService.get($routeParams.purchaseOrderItemId).then(function (result) {
                        ItemService.get(result.item, ['unit']).then(function (item) {
                            $scope.selectedPurchaseOrderItem = {
                                display: item.description,
                                materialCode: item.materialCode,
                                quantity: result.quantity,
                                unit: item.unit.name,
                                information: result
                            };
                            $scope.quantityLeft = computeQuantityLeft();
                            var childNodePromises = [];
                            $scope.planNode.children.forEach(function (child) {
                                childNodePromises.push(DistributionPlanNodeService.getPlanNodeDetails(child.id));
                            });
                            $q.all(childNodePromises).then(function (children) {
                                setDistributionPlanNode(planNode.targetedQuantity, children);
                            });
                        });
                    });
                });
            });
        }
        $scope.showSingleIpMode = function () {
            $scope.inSingleIpMode = true;
            $scope.inMultipleIpMode = false;
        };

        $scope.showMultipleIpMode = function () {
            $scope.inMultipleIpMode = true;
            $scope.inSingleIpMode = false;
        };

        $scope.selectPurchaseOrderItem = function () {
            $scope.track = false;
            $scope.invalidNodes = NaN;
            $scope.distributionPlan = NaN;

            showLoadingModal(true);

            UserService.getCurrentUser().then(function (user) {
                $scope.user = user;
                if ($scope.user.consignee_id) {
                    PurchaseOrderService.getConsigneePurchaseOrderNode($scope.user.consignee_id, $scope.selectedPurchaseOrderItem.information.id).then(function (response) {
                        var node = response;
                        var locPath = $location.path().split('/')[1];
                        var documentId = $scope.distributionPlanReport ? $scope.selectedPurchaseOrder.id : $scope.selectedPurchaseOrder.id;
                        $location.path(
                            '/' + locPath + '/new/' +
                            documentId + '-' +
                            $scope.selectedPurchaseOrderItem.information.id + '-' +
                            node
                        );
                    });
                }
                else {
                    $scope.distributionPlanNodes = [];

                    var selectedPurchaseOrderItem = $scope.selectedPurchaseOrderItem;

                    $scope.totalQuantity = $scope.selectedPurchaseOrderItem.quantity;
                    $scope.quantityLeft = computeQuantityLeft($scope.totalQuantity);

                    PurchaseOrderItemService.get(selectedPurchaseOrderItem.information.id, ['distributionplannode_set'])
                        .then(function (purchaseOrderItem) {
                            PurchaseOrderItemService.getTopLevelDistributionPlanNodes(purchaseOrderItem)
                                .then(function (topLevelNodes) {
                                    setDistributionPlanNode($scope.selectedPurchaseOrderItem.quantity, topLevelNodes);
                                });
                        });
                }
            });
        };

        function savePlanTracking() {
            if ($scope.track && $scope.distributionPlan && (!$scope.planNode || $scope.consigneeLevel)) {
                DistributionPlanService.updatePlanTracking($scope.distributionPlan, $scope.track);
            }
        }

        $scope.trackPurchaseOrderItem = function () {
            $scope.invalidNodes = anyInvalidFields($scope.distributionPlanNodes);
            savePlanTracking();
        };

        function invalidFields(item) {
            return item.targetedQuantity <= 0 || isNaN(item.targetedQuantity) || !item.consignee || !item.location || !item.contactPerson || !item.plannedDistributionDate;
        }

        function anyInvalidFields(lineItems) {
            var itemsWithInvalidFields = lineItems.filter(function (item) {
                return $scope.quantityLeft < 0 || invalidFields(item);
            });
            return itemsWithInvalidFields.length > 0;
        }

        var formatDateForSave = function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        };

        var setDistributionPlanNode = function (totalQuantity, nodes) {
            if (nodes.length) {
                var quantityLeft = parseInt(totalQuantity);
                quantityLeft = quantityLeft - _.reduce(_.pluck(nodes, 'targetedQuantity'), function (total, val) {
                        return total + val;
                    });
                $scope.quantityLeft = quantityLeft.toString();

                $scope.distributionPlanNodes = nodes;
            }
            else {
                $scope.distributionPlanNodes = [];
            }
            setDatePickers();
            showLoadingModal(false);
        };

        $scope.addDistributionPlanNode = function () {
            var distributionPlanNode = {
                item: $scope.selectedPurchaseOrderItem.information.id,
                plannedDistributionDate: '',
                targetedQuantity: 0,
                destinationLocation: '',
                contactPerson: '',
                remark: '',
                track: false,
                isEndUser: false,
                flowTriggered: false
            };

            $scope.distributionPlanNodes.push(distributionPlanNode);
            setDatePickers();
        };

        $scope.$watch('distributionPlanNodes', function (newPlanNodes) {
            if (isNaN($scope.invalidNodes) && $scope.distributionPlanNodes.length) {
                $scope.invalidNodes = true;
                return;
            }

            if (newPlanNodes.length) {
                $scope.quantityLeft = computeQuantityLeft();
                $scope.invalidNodes = anyInvalidFields(newPlanNodes);
            }
        }, true);

        function setDatePickers() {
            $scope.datepicker = {};
            $scope.distributionPlanNodes.forEach(function (item, index) {
                $scope.datepicker[index] = false;
            });
        }

        function parentNodeId() {
            if (!!$scope.planNode) {
                return $scope.planNode.id;
            }
            return null;
        }

        function saveNode(uiPlanNode) {
            var nodeId = uiPlanNode.id;
            var plannedDate = new Date(uiPlanNode.plannedDistributionDate);

            if (plannedDate.toString() === 'Invalid Date') {
                var planDate = uiPlanNode.plannedDistributionDate.split('/');
                plannedDate = new Date(planDate[2], planDate[1] - 1, planDate[0]);
            }

            UserService.getCurrentUser().then(function (user) {
                var node = {
                    consignee: uiPlanNode.consignee.id,
                    location: uiPlanNode.location,
                    contact_person_id: uiPlanNode.contactPerson.id,
                    distribution_plan: $scope.distributionPlan,
                    tree_position: uiPlanNode.isEndUser ? 'END_USER' : (parentNodeId() === null ? 'IMPLEMENTING_PARTNER' : 'MIDDLE_MAN'),
                    parent: parentNodeId(),
                    item: uiPlanNode.item,
                    targeted_quantity: uiPlanNode.targetedQuantity,
                    planned_distribution_date: formatDateForSave(plannedDate),
                    remark: uiPlanNode.remark,
                    track: user.consignee_id ? true : $scope.track
                };
                if ($scope.selectedPurchaseOrder.isSingleIp === null) {
                    savePurchaseOrderIPMode();
                }

                if (nodeId) {
                    node.id = nodeId;
                    node.children = uiPlanNode.children ? uiPlanNode.children : [];

                    return DistributionPlanNodeService.update(node);
                }
                else {
                    return DistributionPlanNodeService.create(node);
                }
            });
        }

        function savePurchaseOrderIPMode() {
            var purchaseOrder = $scope.selectedPurchaseOrder;
            if ($scope.inSingleIpMode) {
                purchaseOrder.isSingleIp = true;
            } else if ($scope.inMultipleIpMode) {
                purchaseOrder.isSingleIp = false;
            }
            var items = [];
            for (var item in $scope.selectedPurchaseOrder.purchaseorderitem_set) {
                items.push(item.id);
            }
            purchaseOrder.purchaseorderitem_set = items;
            PurchaseOrderService.update(purchaseOrder);
        }

        function saveDistributionPlanNodes() {
            var message = $scope.distributionPlanReport ? 'Delivery Saved!' : 'Report Saved!';
            $scope.distributionPlanNodes.forEach(function (node) {
                saveNode(node);
            });
            createToast(message, 'success');
        }

        $scope.warnBeforeSaving = function () {

            if ($scope.selectedPurchaseOrder.isSingleIp === null) {
                $('#confirmation-modal').modal();
            } else {
                $scope.saveDistributionPlanNodes();
            }
        };

        $scope.saveDistributionPlanNodes = function () {
            $('#confirmation-modal').modal('hide');
            if ($scope.distributionPlan) {
                saveDistributionPlanNodes();
            }
            else {
                DistributionPlanService.createPlan({programme: $scope.selectedPurchaseOrder.programme})
                    .then(function (createdPlan) {
                        $scope.distributionPlan = createdPlan.id;
                        saveDistributionPlanNodes();
                    });
            }
        };


        $scope.addSubConsignee = function (node) {
            var locPath = $location.path().split('/')[1];
            var documentId = $scope.selectedPurchaseOrder.id;
            $location.path(
                '/' + locPath + '/' +
                documentId + '-' +
                $scope.selectedPurchaseOrderItem.information.id + '-' +
                node.id
            );
        };

        $scope.showSubConsigneeButton = function (node) {
            return node.id && !node.isEndUser;
        };

        $scope.previousConsignee = function (planNode) {
            var locPath = $location.path().split('/')[1];
            var documentId = $scope.distributionPlanReport ? $scope.selectedPurchaseOrder.id : $scope.selectedPurchaseOrder.id;
            if (planNode.parent) {
                $location.path(
                    '/' + locPath + '/' +
                    documentId + '-' +
                    $scope.selectedPurchaseOrderItem.information.id + '-' +
                    planNode.parent
                );
            }
            else {
                $location.path(
                    '/' + locPath + '/' +
                    documentId + '-' +
                    $scope.selectedPurchaseOrderItem.information.id
                );
            }
        };

        showLoadingModal(false);


    });

