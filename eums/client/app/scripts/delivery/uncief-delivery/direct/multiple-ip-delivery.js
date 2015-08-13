'use strict';


angular.module('MultipleIpDirectDelivery', ['eums.config', 'eums.ip', 'PurchaseOrderItem', 'DeliveryNode', 'User', 'Consignee', 'ngTable', 'ngToast', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives', 'Contact', 'Item'])
    .controller('MultipleIpDirectDeliveryController', function ($scope, $location, $q, IPService, UserService, PurchaseOrderItemService, ConsigneeService, DeliveryService, DeliveryNodeService, ProgrammeService, PurchaseOrderService, $routeParams, ngToast) {

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
        $scope.contact = {};
        $scope.selectedDate = '';
        $scope.selectedLocation = {};
        $scope.consignee = {};
        $scope.lineItem = {};
        $scope.itemIndex = '';
        $scope.track = false;
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
            return !$scope.selectedPurchaseOrderItem ? NaN : $scope.selectedPurchaseOrderItem.quantity;
        };

        $scope.computeQuantityLeft = function (deliveryNodes) {
            var reduced = deliveryNodes.reduce(function (previous, current) {
                return {quantityIn: isNaN(current.quantityIn) ? previous.quantityIn : (previous.quantityIn + current.quantityIn)};
            }, {quantityIn: 0});

            return $scope.getTotalQuantity() - reduced.quantityIn;
        };

        if ($routeParams.purchaseOrderId) {
            if ($routeParams.purchaseOrderType) {
                $scope.inMultipleIpMode = $routeParams.purchaseOrderType == 'multiple';
                $scope.inSingleIpMode = $routeParams.purchaseOrderType == 'single';
            }
            PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item.unit']).then(function (purchaseOrder) {
                $scope.selectedPurchaseOrder = purchaseOrder;
                if (!$routeParams.purchaseOrderType) {
                    if (purchaseOrder.isSingleIp === null) {
                        $scope.inSingleIpMode = false;
                        $scope.inMultipleIpMode = false;
                    } else {
                        $scope.inSingleIpMode = purchaseOrder.isSingleIp;
                        $scope.inMultipleIpMode = !purchaseOrder.isSingleIp;
                    }
                }
                $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
                $scope.selectedPurchaseOrder.totalValue = $scope.purchaseOrderItems.sum(function (orderItem) {
                    return parseFloat(orderItem.value);
                });
                if (purchaseOrder.isSingleIp) {
                    $location.path('/single-ip-direct-delivery/' + purchaseOrder.id)
                }
            });
        }

        if ($routeParams.purchaseOrderItemId) {
            PurchaseOrderItemService.get($routeParams.purchaseOrderItemId, ['item.unit']).then(function (purchaseOrderItem) {
                $scope.selectedPurchaseOrderItem = purchaseOrderItem;
                loadDeliveryDataFor(purchaseOrderItem);
            });
        }

        var loadDeliveryDataFor = function (purchaseOrderItem) {
            var filterParams = {item: purchaseOrderItem.id, parent__isnull: 'true'};
            return DeliveryNodeService.filter(filterParams, ['consignee', 'contact_person_id']).then(function (nodes) {
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

        $scope.showSingleIpMode = function () {
            $location.path('single-ip-direct-delivery/' + $scope.selectedPurchaseOrder.id);
        };

        $scope.showMultipleIpMode = function () {
            $location.path(rootPath + $scope.selectedPurchaseOrder.id + '/multiple');
        };

        $scope.selectPurchaseOrderItem = function (purchaseOrderItem) {
            $location.path(rootPath + $scope.selectedPurchaseOrder.id + '/'
            + ($scope.selectedPurchaseOrder.isSingleIp ? 'single/' : 'multiple/') + purchaseOrderItem.id);
        };

        function invalidFields(item) {
            return item.quantityIn <= 0 || isNaN(item.quantityIn) || !item.consignee || !item.location || !item.contactPerson || !item.deliveryDate;
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

        $scope.addDeliveryNode = function () {
            var distributionPlanNode = {
                item: $scope.selectedPurchaseOrderItem.id,
                deliveryDate: '',
                quantityIn: 0,
                destinationLocation: '',
                contactPerson: '',
                remark: '',
                track: false,
                isEndUser: false
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

        function saveMultipleIPNode(uiPlanNode) {
            var deferred = $q.defer();

            var nodeId = uiPlanNode.id;
            var plannedDate = new Date(uiPlanNode.deliveryDate);

            if (plannedDate.toString() === 'Invalid Date') {
                var planDate = uiPlanNode.deliveryDate.split('/');
                plannedDate = new Date(planDate[2], planDate[1] - 1, planDate[0]);
            }
            var node = {
                consignee: uiPlanNode.consignee.id,
                location: uiPlanNode.location,
                contact_person_id: uiPlanNode.contactPerson.id,
                tree_position: uiPlanNode.isEndUser ? 'END_USER' : 'IMPLEMENTING_PARTNER',
                parent: null,
                item: uiPlanNode.item,
                quantity: uiPlanNode.quantityIn,
                delivery_date: formatDateForSave(plannedDate),
                remark: uiPlanNode.remark,
                track: uiPlanNode.track,
                distribution_plan: uiPlanNode.distributionPlan
            };

            var delivery = {
                programme: $scope.selectedPurchaseOrder.programme,
                consignee: uiPlanNode.consignee.id,
                location: uiPlanNode.location,
                contact_person_id: uiPlanNode.contactPerson.id,
                delivery_date: formatDateForSave(plannedDate),
                remark: uiPlanNode.remark,
                track: uiPlanNode.track
            };

            // Update
            if (nodeId) {
                node.id = nodeId;
                node.children = uiPlanNode.children ? uiPlanNode.children : [];
                delivery.id = node.distribution_plan;
                DeliveryService.update(delivery).then(function () {
                    DeliveryNodeService.update(node).then(function () {
                        uiPlanNode.trackSubmitted = node.track;
                        deferred.resolve(uiPlanNode);
                    });
                });
            }
            // Create
            else {

                DeliveryService.create(delivery).then(function (createdPlan) {
                    uiPlanNode.distributionPlan = createdPlan.id;
                    node.distribution_plan = createdPlan.id;
                    DeliveryNodeService.create(node).then(function (retNode) {
                        uiPlanNode.id = retNode.id;
                        uiPlanNode.trackSubmitted = node.track;
                        uiPlanNode.canReceiveSubConsignees = function () {
                            return this.id && !this.isEndUser;
                        }.bind(uiPlanNode);
                        deferred.resolve(uiPlanNode);
                    });
                }).catch(function () {
                    createToast('Save failed', 'danger');
                });
            }

            return deferred.promise;
        }

        $scope.warnBeforeSaving = function () {
            if ($scope.selectedPurchaseOrder.isSingleIp || $scope.selectedPurchaseOrder.isSingleIp == false) {
                $scope.saveDeliveryNodes();
            } else {
                angular.element('#confirmation-modal').modal();
            }
        };

        $scope.warningAccepted = function () {
            angular.element('#confirmation-modal').modal('hide');
            updateDeliveryStatus();
            $scope.saveDeliveryNodes();
        };

        $scope.saveDeliveryNodes = function () {
            var saveNodePromises = [];
            $scope.distributionPlanNodes.forEach(function (node) {
                saveNodePromises.push(saveMultipleIPNode(node));
            });
            $q.all(saveNodePromises).then(function (savedNodes) {
                $scope.distributionPlanNodes = savedNodes;
                createToast('Delivery Saved!', 'success');
            }).catch(function () {
                createToast('Save failed', 'danger');
            });
        };

        var updateDeliveryStatus = function () {
            PurchaseOrderService.update({id: $scope.selectedPurchaseOrder.id, isSingleIp: false}, 'PATCH');
            $scope.selectedPurchaseOrder.isSingleIp = false;
        }

        showLoadingModal(false);
    }
);
