'use strict';


angular.module('DirectDeliveryManagement', ['eums.config', 'eums.ip', 'PurchaseOrderItem', 'DistributionPlanNode', 'User', 'Consignee', 'ngTable', 'ngToast', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives', 'Contact', 'Item'])
    .controller('DirectDeliveryManagementController', function ($scope, $location, $q, IPService, UserService, PurchaseOrderItemService, ConsigneeService, DistributionPlanService, DistributionPlanNodeService, ProgrammeService, PurchaseOrderService, $routeParams, ngToast) {

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
        $scope.selectedDate = '';
        $scope.selectedLocation = {};
        $scope.consignee = {};
        $scope.lineItem = {};
        $scope.itemIndex = '';
        $scope.track = false;
        $scope.consigneeLevel = false;
        $scope.isReport = false;
        $scope.districtsLoaded = false;
        $scope.IPsLoaded = false;
        var rootPath = '/direct-delivery/new/';

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
            $scope.districtsLoaded = true;
        });

        $scope.invalidContact = function (contact) {
            return !(contact.firstName && contact.lastName && contact.phone);
        };

        $scope.distributionPlanNodes = [];
        $scope.purchaseOrderItems = [];
        $scope.implementingPartners = [];

        $scope.getTotalQuantity = function () {
            return !$scope.parentNode ? !$scope.selectedPurchaseOrderItem ? NaN : $scope.selectedPurchaseOrderItem.quantity : $scope.parentNode.targetedQuantity;
        };

        $scope.computeQuantityLeft = function (deliveryNodes) {
            var reduced = deliveryNodes.reduce(function (previous, current) {
                return {targetedQuantity: isNaN(current.targetedQuantity) ? previous.targetedQuantity : (previous.targetedQuantity + current.targetedQuantity)};
            }, {targetedQuantity: 0});

            return $scope.getTotalQuantity() - reduced.targetedQuantity;
        };

        function updateIpMode(purchaseOrder) {
            if (purchaseOrder.isSingleIp === null) {
                $scope.inSingleIpMode = false;
                $scope.inMultipleIpMode = false;
            } else {
                $scope.inSingleIpMode = purchaseOrder.isSingleIp;
                $scope.inMultipleIpMode = !purchaseOrder.isSingleIp;
            }
        }

        PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item.unit']).then(function (purchaseOrder) {
            $scope.selectedPurchaseOrder = purchaseOrder;
            updateIpMode(purchaseOrder);
            $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
            $scope.selectedPurchaseOrder.totalValue = $scope.purchaseOrderItems.sum(function (orderItem) {
                return parseFloat(orderItem.value);
            });
        });

        if ($routeParams.purchaseOrderItemId) {
            PurchaseOrderItemService.get($routeParams.purchaseOrderItemId, ['item.unit']).then(function (purchaseOrderItem) {
                $scope.selectedPurchaseOrderItem = purchaseOrderItem;
                !$routeParams.deliveryNodeId && loadDeliveryDataFor(purchaseOrderItem);
            });
        }

        var loadDeliveryDataFor = function (purchaseOrderItem) {
            var filterParams = {item: purchaseOrderItem.id, parent__isnull: 'true'};
            return DistributionPlanNodeService.filter(filterParams, ['consignee', 'contact_person_id', 'children']).then(function (nodes) {
                $scope.distributionPlanNodes = nodes;
                resetFields();
            });
        };

        var resetFields = function () {
            if (!$scope.distributionPlanNodes || $scope.distributionPlanNodes.length === 0) {
                $scope.track = false;
                $scope.invalidNodes = NaN;
                $scope.distributionPlan = NaN;
            }
        };

        if ($routeParams.deliveryNodeId) {
            $scope.consigneeButtonText = 'Add Sub-Consignee';

            DistributionPlanNodeService.getPlanNodeDetails($routeParams.deliveryNodeId).then(function (planNode) {
                $scope.parentNode = planNode;
                $scope.distributionPlanNodes = planNode.children;

                resetFields();

                UserService.getCurrentUser().then(function (user) {
                    if (user.consignee_id) {
                        $scope.consigneeLevel = $scope.parentNode.parent ? false : true;
                    }

                    $scope.distributionPlan = planNode.distributionPlan;
                    $scope.track = planNode.track;

                    setDatePickers();
                    showLoadingModal(false);

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

        var saveDeliveryNodes = function () {
            $scope.purchaseOrderItems.forEach(function (purchaseOrderItem) {
                saveDeliveryNode(purchaseOrderItem);
            });
        };

        var saveSingleIPDeliveryNodes = function () {
            showLoadingModal(true);
            saveDeliveryNodes();

            if ($scope.selectedPurchaseOrder.isSingleIp === null) {
                savePurchaseOrderIPMode();
            }
        };

        var isValidDelivery = function () {
            return validate($scope.consignee.id, 'Fill in IP field!') &&
                validate($scope.selectedDate, 'Fill in Date field!') &&
                validate($scope.contact.id, 'Fill in Contact field!') &&
                validate($scope.selectedLocation.id, 'Fill in Location field!');
        };

        var validate = function (field, message) {
            if (!field) {
                createToast(message, 'danger');
                return false;
            } else {
                return true;
            }
        };

        var getNodeForItem = function (purchaseOrderItem) {
            return $scope.distributionPlanNodes.find(function (node) {
                return node.item === purchaseOrderItem.id;
            });
        };

        var saveDeliveryNode = function (purchaseOrderItem) {
            var deliveryDate = new Date($scope.selectedDate);

            if (deliveryDate.toString() === 'Invalid Date') {
                var planDate = $scope.selectedDate.split('/');
                deliveryDate = new Date(planDate[2], planDate[1] - 1, planDate[0]);
            }
            var node = getNodeForItem(purchaseOrderItem);
            if (node) {
                node.location = $scope.selectedLocation.id;
                node.contact_person_id = $scope.contact.id;
                node.planned_distribution_date = formatDateForSave(deliveryDate);
                DistributionPlanNodeService.update(node).then(function () {
                        showLoadingModal(false);
                    },
                    function (response) {
                        handleErrors(response);
                    });
            } else {
                node = {
                    consignee: $scope.consignee.id,
                    location: $scope.selectedLocation.id,
                    contact_person_id: $scope.contact.id,
                    distribution_plan: $scope.distributionPlanId,
                    tree_position: 'IMPLEMENTING_PARTNER',
                    item: purchaseOrderItem.id,
                    targeted_quantity: parseInt(purchaseOrderItem.quantity),
                    planned_distribution_date: formatDateForSave(deliveryDate),
                    track: false
                };
                DistributionPlanNodeService.create(node).then(function (created) {
                    node.id = created.id;
                    showLoadingModal(false);
                }, function (response) {
                    handleErrors(response, purchaseOrderItem.materialCode);
                });
            }
        };

        var handleErrors = function (response, materialCode) {
            var message = '';
            var errors = response.data;
            for (var property in errors) {
                message += 'Material: ' + materialCode + ', ' + property + ': ' + errors[property] + '\n';
            }
            $scope.nodeSavingErrors = true;
            createToast(message, 'danger');
        };

        $scope.selectPurchaseOrderItem = function (purchaseOrderItem) {
            $location.path(rootPath + $scope.selectedPurchaseOrder.id + '-' + purchaseOrderItem.id);
        };

        function savePlanTracking() {
            if ($scope.track && $scope.distributionPlan && (!$scope.parentNode || $scope.consigneeLevel)) {
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

        $scope.addDistributionPlanNode = function () {
            var distributionPlanNode = {
                item: $scope.selectedPurchaseOrderItem.id,
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
                $scope.quantityLeft = $scope.computeQuantityLeft(newPlanNodes);
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
            if ($scope.parentNode) {
                return $scope.parentNode.id;
            }
            return null;
        }

        function saveMultipleIPNode(uiPlanNode) {
            var deferred = $q.defer();

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
                    distribution_plan: $scope.distributionPlan.id,
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

                    DistributionPlanNodeService.update(node).then(function () {
                        deferred.resolve(uiPlanNode);
                    });
                }
                else {
                    DistributionPlanNodeService.create(node).then(function (retNode) {
                        uiPlanNode.id = retNode.id;
                        uiPlanNode.canReceiveSubConsignees = function () {
                            return this.id && !this.isEndUser;
                        }.bind(uiPlanNode);
                        deferred.resolve(uiPlanNode);
                    });
                }
            }).catch(function () {
                deferred.reject();
            });
            return deferred.promise;
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

        function saveMultipleIpDeliveryNodes() {
            var message = 'Delivery Saved!';
            var pNodes = $scope.distributionPlanNodes;
            $scope.distributionPlanNodes = [];
            var nodesCumulator = [];
            var saveNodePromises = [];

            pNodes.forEach(function (node) {
                saveNodePromises.push[saveMultipleIPNode(node).then(function (upToDateNode) {
                    return nodesCumulator.push(upToDateNode);
                })];
            });

            $q.all(saveNodePromises).then(function () {
                $scope.distributionPlanNodes = nodesCumulator;
                createToast(message, 'success');
            });

        }

        $scope.warnBeforeSaving = function () {
            if ($scope.inMultipleIpMode || ($scope.inSingleIpMode && isValidDelivery())) {
                if ($scope.selectedPurchaseOrder.isSingleIp === null) {
                    $('#confirmation-modal').modal();
                } else {
                    $scope.warningAccepted();
                }
            }
        };

        $scope.warningAccepted = function () {
            $('#confirmation-modal').modal('hide');
            $scope.saveDistributionPlanNodes();
        };

        $scope.saveDistributionPlanNodes = function () {
            if (!$scope.distributionPlanId) {
                DistributionPlanService.createPlan({programme: $scope.selectedPurchaseOrder.programme})
                    .then(function (createdPlan) {
                        $scope.distributionPlan = createdPlan;
                        $scope.distributionPlanId = createdPlan.id;
                        if ($scope.inSingleIpMode) {
                            saveSingleIPDeliveryNodes();
                        } else if ($scope.inMultipleIpMode) {
                            saveMultipleIpDeliveryNodes();
                        }
                    });
            } else {
                if ($scope.inSingleIpMode) {
                    saveSingleIPDeliveryNodes();
                } else if ($scope.inMultipleIpMode) {
                    saveMultipleIpDeliveryNodes();
                }
            }
        };


        $scope.addSubConsignee = function (node) {
            $location.path(rootPath + $scope.selectedPurchaseOrder.id + '-' + $scope.selectedPurchaseOrderItem.id + '-' + node.id);
        };

        $scope.showSubConsigneeButton = function (node) {
            return node.id && !node.isEndUser;
        };

        $scope.previousConsignee = function (planNode) {
            var path = rootPath + $scope.selectedPurchaseOrder.id + '-' + $scope.selectedPurchaseOrderItem.id;
            $location.path(planNode.parent ? path + '-' + planNode.parent : path);
        };

        showLoadingModal(false);

    });

