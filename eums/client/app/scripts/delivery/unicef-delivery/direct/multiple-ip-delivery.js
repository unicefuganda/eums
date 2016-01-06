'use strict';

angular.module('MultipleIpDirectDelivery', ['eums.config', 'eums.ip', 'PurchaseOrderItem', 'DeliveryNode', 'User', 'Consignee', 'ngTable',
        'ngToast', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives', 'Contact', 'Item', 'Loader'])
    .controller('MultipleIpDirectDeliveryController', function ($scope, $location, $q, $timeout, IPService, UserService, PurchaseOrderItemService,
                                                                ConsigneeService, DeliveryService, DeliveryNodeService, ProgrammeService,
                                                                PurchaseOrderService, $routeParams, ngToast, LoaderService) {

            var rootPath = '/direct-delivery/new/';

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
            $scope.distributionPlanNodes = [];
            $scope.purchaseOrderItems = [];
            $scope.implementingPartners = [];
            $scope.isSaving = false;

            $scope.addContact = function (node, nodeIndex) {
                $scope.$broadcast('add-contact', node, nodeIndex);
            };

            $scope.invalidContact = function (contact) {
                return !(contact.firstName && contact.lastName && contact.phone);
            };

            $scope.getTotalQuantity = function () {
                return !$scope.selectedPurchaseOrderItem ? NaN : $scope.selectedPurchaseOrderItem.quantity;
            };

            $scope.computeQuantityLeft = function (deliveryNodes) {
                var reduced = deliveryNodes.reduce(function (previous, current) {
                    return {quantityIn: isNaN(current.quantityIn) ? previous.quantityIn : (previous.quantityIn + current.quantityIn)};
                }, {quantityIn: 0});
                return $scope.getTotalQuantity() - reduced.quantityIn;
            };

            $scope.addDeliveryNode = function () {
                var distributionPlanNode = {
                    item: $scope.selectedPurchaseOrderItem.id,
                    deliveryDate: '',
                    quantityIn: 0,
                    destinationLocation: '',
                    contactPerson: '',
                    track: false,
                    timeLimitationOnDistribution: null,
                    trackedDate: null
                };

                $scope.distributionPlanNodes.push(distributionPlanNode);
                setDatePickers();
            };

            $scope.save = function () {
                $scope.saveDeliveryNodes();
                if ($scope.selectedPurchaseOrder.isSingleIp == null) {
                    updateDeliveryStatus();
                }
            };

            $scope.saveDeliveryNodes = function () {
                $scope.isSaving = true;
                var saveNodePromises = [];
                $scope.distributionPlanNodes.forEach(function (node) {
                    saveNodePromises.push(saveMultipleIPNode(node));
                });
                $q.all(saveNodePromises).then(function (savedNodes) {
                    $scope.distributionPlanNodes = savedNodes;
                    createToast('Delivery Saved!', 'success');
                }).catch(function () {
                    createToast('Save failed', 'danger');
                }).finally(function () {
                    $scope.isSaving = false;
                });
            };

            $scope.selectPurchaseOrderItem = function (purchaseOrderItem) {
                $location.path(rootPath + $scope.selectedPurchaseOrder.id + '/'
                    + ($scope.selectedPurchaseOrder.isSingleIp ? 'single/' : 'multiple/') + purchaseOrderItem.id);
            };

            init();

            function init() {
                LoaderService.showLoader();

                IPService.loadAllDistricts().then(function (response) {
                    $scope.districts = response.data.map(function (district) {
                        return {id: district, name: district};
                    });
                    $scope.districtsLoaded = true;
                });

                if ($routeParams.purchaseOrderId) {
                    PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item']).then(function (purchaseOrder) {
                        $scope.selectedPurchaseOrder = purchaseOrder;
                        $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
                        $scope.selectedPurchaseOrder.totalValue = $scope.purchaseOrderItems.sum(function (orderItem) {
                            return parseFloat(orderItem.value);
                        });
                        LoaderService.hideLoader();
                    });
                }

                if ($routeParams.purchaseOrderItemId) {
                    PurchaseOrderItemService.get($routeParams.purchaseOrderItemId, ['item']).then(function (purchaseOrderItem) {
                        $scope.selectedPurchaseOrderItem = purchaseOrderItem;
                        loadDeliveryDataFor(purchaseOrderItem);
                    });
                }

                $scope.$on('contact-saved', function (event, contact, node, nodeIndex) {
                    node.contactPerson = {id: contact._id};
                    $scope.$broadcast('set-contact-for-node', contact, nodeIndex);
                    event.stopPropagation();
                });

                $scope.$watch('distributionPlanNodes', function (newPlanNodes) {
                    if (isNaN($scope.invalidNodes) && $scope.distributionPlanNodes.length) {
                        $scope.invalidNodes = true;
                        return;
                    }

                    if (newPlanNodes.length) {
                        $scope.quantityLeft = $scope.computeQuantityLeft(newPlanNodes);
                        var hasInvalidNodes = anyInvalidFields(newPlanNodes);
                        var areAllItemsSavedAndTracked = _.all(newPlanNodes, function (item) {
                            return item.track && item.trackSubmitted;
                        });
                        $scope.invalidNodes = hasInvalidNodes || areAllItemsSavedAndTracked;
                    }
                }, true);
            }

            function loadDeliveryDataFor(purchaseOrderItem) {
                var filterParams = {item: purchaseOrderItem.id, is_root: 'true'};

                return DeliveryNodeService.filter(filterParams, ['consignee', 'contact_person_id']).then(function (nodes) {
                    $scope.distributionPlanNodes = nodes;
                    resetFields();
                });
            }

            function resetFields() {
                if (!$scope.distributionPlanNodes || $scope.distributionPlanNodes.length === 0) {
                    $scope.track = false;
                    $scope.invalidNodes = NaN;
                    $scope.distributionPlan = NaN;
                }
            }

            function createToast(message, klass) {
                ngToast.create({
                    content: message,
                    class: klass,
                    maxNumber: 1,
                    dismissOnTimeout: true
                });
            }

            function invalidFields(item) {
                return item.quantityIn <= 0 || isNaN(item.quantityIn)
                    || !item.consignee
                    || !item.location
                    || !item.contactPerson
                    || !item.deliveryDate
                    || (item.timeLimitationOnDistribution != null && item.timeLimitationOnDistribution <= 0);
            }

            function anyInvalidFields(lineItems) {
                var itemsWithInvalidFields = lineItems.filter(function (item) {
                    return $scope.quantityLeft < 0 || invalidFields(item);
                });
                return itemsWithInvalidFields.length > 0;
            }

            function formatDateForSave(date) {
                return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            }

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
                    tree_position: 'IMPLEMENTING_PARTNER',
                    parent: null,
                    item: uiPlanNode.item,
                    quantity: uiPlanNode.quantityIn,
                    delivery_date: formatDateForSave(plannedDate),
                    track: uiPlanNode.track,
                    distribution_plan: uiPlanNode.distributionPlan
                };

                if (uiPlanNode.track && (uiPlanNode.id == null || uiPlanNode.trackedDate == null)) {
                    uiPlanNode.trackedDate = new Date();
                }

                var delivery = {
                    programme: $scope.selectedPurchaseOrder.programme,
                    consignee: uiPlanNode.consignee.id,
                    location: uiPlanNode.location,
                    time_limitation_on_distribution: uiPlanNode.timeLimitationOnDistribution || null,
                    contact_person_id: uiPlanNode.contactPerson.id,
                    delivery_date: formatDateForSave(plannedDate),
                    track: uiPlanNode.track,
                    tracked_date: uiPlanNode.trackedDate
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
                            deferred.resolve(uiPlanNode);
                        });
                    }).catch(function () {
                        createToast('Save failed', 'danger');
                    });
                }

                return deferred.promise;
            }

            function updateDeliveryStatus() {
                PurchaseOrderService.update({id: $scope.selectedPurchaseOrder.id, isSingleIp: false}, 'PATCH');
                $scope.selectedPurchaseOrder.isSingleIp = false;
            }
        }
    );
