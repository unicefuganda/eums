'use strict';

angular.module('WarehouseDeliveryPlan', ['DistributionPlan', 'ngTable', 'siTable', 'DistributionPlanNode', 'ui.bootstrap',
    'Consignee', 'PurchaseOrder', 'PurchaseOrderItem', 'ReleaseOrder', 'ReleaseOrderItem', 'eums.ip', 'ngToast', 'Contact', 'User', 'Item'])
    .controller('WarehouseDeliveryPlanController', function ($scope, $location, $q, $routeParams, DistributionPlanService,
                                                             DistributionPlanNodeService, ConsigneeService, PurchaseOrderService,
                                                             PurchaseOrderItemService, ReleaseOrderService, ReleaseOrderItemService,
                                                             IPService, UserService, ItemService, ngToast,
                                                             ContactService) {
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
        $scope.deliverNewDistributionPlanyDateHeaderText = $scope.distributionPlanReport ? 'Delivery Date' : 'Date Delivered';

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }

        function showLoadingModal(show) {
            if (show && !angular.element('#loading').hasClass('in')) {
                angular.element('#loading').modal();
            }
            else if (!show) {
                angular.element('#loading').modal('hide');
                angular.element('#loading.modal').removeClass('in');
            }
        }

        $scope.addContact = function (itemIndex, lineItem) {
            $scope.$parent.itemIndex = itemIndex;
            $scope.$parent.lineItem = lineItem;
            $('#add-contact-modal').modal();
        };

        $scope.addRemark = function (itemIndex, lineItem) {
            $scope.$parent.itemIndex = itemIndex;
            $scope.$parent.lineItem = lineItem;
            $('#add-remark-modal').modal();
        };

        $scope.saveContact = function () {
            ContactService
                .create($scope.contact)
                .then(function (contact) {
                    $('#add-contact-modal').modal('hide');

                    var contactInput = $('#contact-select-' + $scope.itemIndex);
                    var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
                    contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);

                    contactInput.val(contact._id);
                    $scope.lineItem.contactPerson = contact._id;

                    $scope.contact = {};
                }, function (response) {
                    createToast(response.data.error, 'danger');
                });
        };

        $scope.invalidContact = function (contact) {
            return !(contact.firstName && contact.lastName && contact.phone);
        };

        showLoadingModal(true);

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
        });

        ConsigneeService.all().then(function (consignees) {
            $scope.consignees = consignees;
        });

        $scope.deliveryPlanNodes = [];
        $scope.releaseOrderItems = [];

        ReleaseOrderService.get($routeParams.releaseOrderId, ['releaseorderitem_set.item.unit']).then(function (releaseOrder) {
            $scope.selectedReleaseOrder = releaseOrder;
            $scope.releaseOrderItems = releaseOrder.releaseorderitemSet;
        });

        $scope.selectReleaseOrderItem = function () {
            $scope.track = false;
            $scope.invalidNodes = NaN;
            $scope.distributionPlan = NaN;

            showLoadingModal(true);
            $scope.deliveryPlanNodes = [];

            console.log('selected release order ' +  $scope.selectedReleaseOrderItem.id + $scope.selectedReleaseOrderItem);
            ReleaseOrderItemService.get($scope.selectedReleaseOrderItem.id, ['distributionplannode_set']).then(function (releaseOrderItem) {
                $scope.selectedReleaseOrderItem = releaseOrderItem;
                DistributionPlanNodeService.getTopLevelDistributionPlanNodes(releaseOrderItem)
                    .then(function (topLevelNodes) {
                        setDistributionPlanNode(releaseOrderItem, topLevelNodes);
                    });
            });
        };

        if ($routeParams.distributionPlanNodeId) {
            $scope.consigneeButtonText = 'Add Sub-Consignee';

            DistributionPlanNodeService.getPlanNodeDetails($routeParams.distributionPlanNodeId).then(function (planNode) {
                $scope.planNode = planNode;

                UserService.getCurrentUser().then(function (user) {
                    $scope.user = user;
                    if ($scope.user.consignee_id) {
                        $scope.consigneeLevel = $scope.planNode.parent ? false : true;
                    }

                    $scope.distributionPlan = planNode.distributionPlan;
                    $scope.track = planNode.track;

                    PurchaseOrderItemService.get($routeParams.purchaseOrderItemId).then(function (result) {
                        ItemService.get(result.item, ['unit']).then(function (item) {
                            $scope.selectedReleaseOrderItem = {
                                display: item.description,
                                materialCode: item.materialCode,
                                quantity: result.quantity,
                                unit: item.unit.name,
                                information: result
                            };
                            $scope.selectedReleaseOrderItem.quantityLeft = computeQuantityLeft($scope.selectedReleaseOrderItem);
                            var childNodePromises = [];
                            $scope.planNode.children.forEach(function (child) {
                                childNodePromises.push(DistributionPlanNodeService.getPlanNodeDetails(child.id));
                            });
                            $q.all(childNodePromises).then(function (children) {
                                setDistributionPlanNode($scope.selectedReleaseOrderItem, children);
                            });
                        });
                    });
                });
            });
        }

        function savePlanTracking() {
            if ($scope.track && $scope.distributionPlan && (!$scope.planNode || $scope.consigneeLevel)) {
                DistributionPlanService.updatePlanTracking($scope.distributionPlan, $scope.track);
            }
        }

        $scope.trackPurchaseOrderItem = function () {
            $scope.invalidNodes = anyInvalidFields($scope.deliveryPlanNodes);
            savePlanTracking();
        };

        var formatDateForSave = function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        };

        var setDistributionPlanNode = function (selectedReleaseOrderItem, nodes) {
            if (nodes.length) {
                var quantityLeft = parseInt(selectedReleaseOrderItem.quantity);
                quantityLeft = quantityLeft - _.reduce(_.pluck(nodes, 'targetedQuantity'), function (total, val) {
                    return total + val;
                });
                $scope.selectedReleaseOrderItem.quantityLeft = quantityLeft.toString();
                $scope.deliveryPlanNodes = nodes;
            }
            else {
                $scope.deliveryPlanNodes = [];
            }
            setDatePickers();
            showLoadingModal(false);
        };

        $scope.addDeliveryPlanNode = function  () {
            var distributionPlanNode = {
                item: $scope.selectedReleaseOrderItem.information.id,
                plannedDistributionDate: '',
                targetedQuantity: 0,
                destinationLocation: '',
                contactPerson: '',
                remark: '',
                track: false,
                forEndUser: false,
                flowTriggered: false
            };

            $scope.deliveryPlanNodes.push(distributionPlanNode);
            setDatePickers();
        };

        function computeQuantityLeft(purchaseOrderItem) {
            var reduced = $scope.deliveryPlanNodes.reduce(function (previous, current) {
                return {targetedQuantity: isNaN(current.targetedQuantity) ? previous.targetedQuantity : (previous.targetedQuantity + current.targetedQuantity)};
            }, {targetedQuantity: 0});

            return purchaseOrderItem.quantity - reduced.targetedQuantity;
        }

        function invalidFields(item) {
            return item.targetedQuantity <= 0 || isNaN(item.targetedQuantity) || !item.consignee || !item.destinationLocation || !item.contactPerson || !item.plannedDistributionDate;
        }

        function anyInvalidFields(lineItems) {
            var itemsWithInvalidFields = lineItems.filter(function (item) {
                return $scope.selectedReleaseOrderItem.quantityLeft < 0 || invalidFields(item);
            });
            return itemsWithInvalidFields.length > 0;
        }

        $scope.$watch('deliveryPlanNodes', function (newPlanNodes) {
            if (isNaN($scope.invalidNodes) && $scope.deliveryPlanNodes.length) {
                $scope.invalidNodes = true;
                return;
            }

            if (newPlanNodes.length) {
                $scope.selectedReleaseOrderItem.quantityLeft = computeQuantityLeft($scope.selectedReleaseOrderItem);
                $scope.invalidNodes = anyInvalidFields(newPlanNodes);
            }
        }, true);

        function setDatePickers() {
            $scope.datepicker = {};
            $scope.deliveryPlanNodes.forEach(function (item, index) {
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
                    tree_position: uiPlanNode.forEndUser ? 'END_USER' : (parentNodeId() === null ? 'IMPLEMENTING_PARTNER' : 'MIDDLE_MAN'),
                    parent: parentNodeId(),
                    item: uiPlanNode.item,
                    targeted_quantity: uiPlanNode.targetedQuantity,
                    planned_distribution_date: formatDateForSave(plannedDate),
                    remark: uiPlanNode.remark,
                    track: user.consignee_id ? true : $scope.track
                };

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

        function saveDeliveryPlanNodes() {
            var message = $scope.distributionPlanReport ? 'Plan Saved!' : 'Report Saved!';
            $scope.deliveryPlanNodes.forEach(function (node) {
                saveNode(node);
            });
            createToast(message, 'success');
        }

        $scope.saveDeliveryPlanNodes = function () {
            if ($scope.distributionPlan) {
                saveDeliveryPlanNodes();
            }
            else {
                DistributionPlanService.createPlan({programme: $scope.selectedReleaseOrder.programme})
                    .then(function (createdPlan) {
                        $scope.distributionPlan = createdPlan.id;
                        saveDeliveryPlanNodes();
                    });
            }
        };

        $scope.addSubConsignee = function (node) {
            var locPath = $location.path().split('/')[1];
            var documentId = $scope.distributionPlanReport ? $scope.selectedReleaseOrder.id : $scope.selectedReleaseOrder.id;
            $location.path(
                '/' + locPath + '/new/' +
                documentId + '-' +
                $scope.selectedReleaseOrderItem.information.id + '-' +
                node.id
            );
        };

        $scope.showSubConsigneeButton = function (node) {
            return node.id && !node.forEndUser;
        };

        $scope.previousConsignee = function (planNode) {
            var locPath = $location.path().split('/')[1];
            var documentId = $scope.distributionPlanReport ? $scope.selectedReleaseOrder.id : $scope.selectedReleaseOrder.id;
            if (planNode.parent) {
                $location.path(
                    '/' + locPath + '/new/' +
                    documentId + '-' +
                    $scope.selectedReleaseOrderItem.information.id + '-' +
                    planNode.parent
                );
            }
            else {
                $location.path(
                    '/' + locPath + '/new/' +
                    documentId + '-' +
                    $scope.selectedReleaseOrderItem.information.id
                );
            }
        };
    }
);