angular.module('SingleIpDirectDelivery', ['ngToast', 'DistributionPlanNode'])
    .controller('SingleIpDirectDeliveryController', function ($scope, PurchaseOrderService, $routeParams, IPService,
                                                              ngToast, DistributionPlanService, DeliveryNode, $q,
                                                              DistributionPlanNodeService) {
        $scope.consignee = {};
        $scope.contact = {};
        $scope.district = {};

        loadOrderData();

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
            $scope.districtsLoaded = true;
        });

        $scope.save = function (tracked) {
            $scope.tracked = tracked || false;
            if (scopeDataIsValid()) {
                $scope.purchaseOrder.isSingleIp ? saveDelivery() : angular.element('#confirmation-modal').modal();
            }
            else {
                $scope.errors = true;
                createToast('Cannot save. Please fill out or fix values for all fields marked in red', 'danger')
            }
        };

        $scope.warningAccepted = function () {
            angular.element('#confirmation-modal').modal('hide');
            saveDelivery();
        };

        $scope.cannotChangeIp = function () {
            return $scope.trackedDeliveries.length;
        };

        $scope.addRemark = function () {
            angular.element('#add-remark-modal').modal();
        };

        var saveDelivery = function () {
            var totalQuantityShipped = $scope.purchaseOrderItems.sum(function (item) {
                return item.quantityShipped || 0;
            });
            if (!$scope.delivery.id && totalQuantityShipped) {
                showLoader();
                createDelivery()
                    .then(createDeliveryNodes)
                    .then(updatePurchaseOrderDeliveryMode)
                    .then(loadOrderData)
                    .then(notifyOnSuccess)
                    .catch(alertOnSaveFailure)
                    .finally(hideLoader)
            }
            else if ($scope.delivery.id && totalQuantityShipped) {
                showLoader();
                updateDelivery()
                    .then(updateOrCreateDeliveryNodes)
                    .then(loadOrderData)
                    .then(function () {
                        notifyOnSuccess('Delivery updated');
                    })
                    .catch(alertOnSaveFailure)
                    .finally(hideLoader);
            }
            else if (!totalQuantityShipped) {
                createToast('Cannot save delivery with zero quantity shipped', 'danger');
            }
        };

        function loadOrderData() {
            showLoader();
            var fieldsToBuild = ['purchaseorderitem_set.item'];
            PurchaseOrderService.get($routeParams.purchaseOrderId, fieldsToBuild).then(function (purchaseOrder) {
                $scope.purchaseOrder = purchaseOrder;
                var promises = [];
                promises.push(loadPurchaseOrderValue(purchaseOrder));
                promises.push(loadPurchaseOrderDeliveries(purchaseOrder).then(function () {
                    return attachNodesToItems(purchaseOrder.purchaseorderitemSet).then(function (items) {
                        $scope.purchaseOrderItems = items.map(setItemQuantityShipped);
                        $scope.contentLoaded = true;
                    });
                }));
                $q.all(promises).then(hideLoader);
            });
        }

        function attachNodesToItems(items) {
            if ($scope.delivery && $scope.delivery.id) {
                var filterParams = {distribution_plan: $scope.delivery.id, parent__isnull: true};
                return DistributionPlanNodeService.filter(filterParams).then(function (nodes) {
                    return items.map(function (item) {
                        var matchingNode = findNodeForItem(item, nodes);
                        return matchingNode ? Object.merge(item, {node: matchingNode}) : item;
                    });
                });
            }
            return $q.when(items);
        }

        function scopeDataIsValid() {
            var someInputsAreEmpty = !(
                $scope.delivery.contact_person_id
                && $scope.delivery.consignee
                && $scope.delivery.delivery_date
                && $scope.delivery.location
            );
            var someItemsAreInvalid = $scope.purchaseOrderItems.any(function (item) {
                return item.isInvalid(item.quantityShipped);
            });
            return !someInputsAreEmpty && !someItemsAreInvalid;
        }

        function getDeliveryFields() {
            return {
                programme: $scope.purchaseOrder.programme,
                consignee: $scope.delivery.consignee,
                location: $scope.delivery.location,
                delivery_date: moment(new Date($scope.delivery.delivery_date)).format('YYYY-MM-DD'),
                contact_person_id: $scope.delivery.contact_person_id,
                remark: $scope.delivery.remark,
                track: $scope.tracked
            };
        }

        function createDelivery() {
            var deliveryFields = getDeliveryFields();
            return DistributionPlanService.createPlan(deliveryFields);
        }

        function updateDelivery() {
            var deliveryFields = getDeliveryFields();
            deliveryFields.id = $scope.delivery.id;
            return DistributionPlanService.update(deliveryFields);
        }

        function loadPurchaseOrderValue(purchaseOrder) {
            PurchaseOrderService.getDetail(purchaseOrder, 'total_value').then(function (totalValue) {
                purchaseOrder.totalValue = totalValue;
            });
        }

        function setItemQuantityShipped(item) {
            var quantityShipped = item.node ? item.node.targetedQuantity : item.availableBalance;
            return Object.merge(item, {quantityShipped: quantityShipped})
        }

        function loadPurchaseOrderDeliveries(purchaseOrder) {
            return PurchaseOrderService.getDetail(purchaseOrder, 'deliveries').then(function (deliveries) {
                $scope.trackedDeliveries = deliveries.filter(function (delivery) {
                    return delivery.track;
                });

                $scope.delivery = deliveries.filter(function (delivery) {
                        return !delivery.track;
                    }).first() || {};

                //Because line item partial sucks
                $scope.lineItem.remark = $scope.delivery.remark;

                setDeliveryDataFromPastDelivery($scope.trackedDeliveries);
            });
        }

        function setDeliveryDataFromPastDelivery(trackedDeliveries) {
            if (trackedDeliveries.length) {
                var firstDelivery = trackedDeliveries.first();
                $scope.delivery.consignee = firstDelivery.consignee;
                $scope.delivery.contact_person_id = firstDelivery.contact_person_id;
                $scope.delivery.location = firstDelivery.location;
            }
        }

        function getNodeFields(item, delivery) {
            return {
                item: item,
                targetedQuantity: item.quantityShipped,
                distributionPlan: delivery,
                consignee: delivery.consignee,
                location: delivery.location,
                deliveryDate: moment(new Date($scope.delivery.delivery_date)).format('YYYY-MM-DD'),
                contactPerson: delivery.contact_person_id,
                remark: delivery.remark,
                track: delivery.track,
                isEndUser: false,
                treePosition: 'IMPLEMENTING_PARTNER'
            };
        }

        function createDeliveryNodes(createdDelivery) {
            function createNodeFrom(purchaseOrderItem) {
                return DistributionPlanNodeService.create(new DeliveryNode(getNodeFields(purchaseOrderItem, createdDelivery)));
            }

            var createNodePromises = [];
            $scope.purchaseOrderItems.forEach(function (purchaseOrderItem) {
                purchaseOrderItem.quantityShipped && createNodePromises.push(createNodeFrom(purchaseOrderItem));
            });
            return $q.all(createNodePromises);
        }

        function updateOrCreateDeliveryNodes() {
            var filterParams = {distribution_plan: $scope.delivery.id, parent__isnull: true};
            DistributionPlanNodeService.filter(filterParams).then(function (nodes) {
                var mappedItems = $scope.purchaseOrderItems.map(function (item) {
                    var matchingNode = findNodeForItem(item, nodes);
                    return matchingNode ? Object.merge(item, {nodeId: matchingNode.id}) : item;
                });
                mappedItems.forEach(function (item) {
                    if (item.nodeId) {
                        var deliveryNode = new DeliveryNode(getNodeFields(item, $scope.delivery));
                        DistributionPlanNodeService.update(Object.merge(deliveryNode, {
                            id: item.nodeId,
                            item: item.id
                        }));
                    }
                    //else create a new node for that item because one has not been created yet
                })
            });
        }

        //Because remark partial sucks
        $scope.lineItem = {};
        $scope.$watch('lineItem.remark', function (remark) {
            if (remark) {
                $scope.delivery.remark = remark;
            }
        });

        function findNodeForItem(item, nodes) {
            return nodes.find(function (node) {
                return node.item === item.id;
            });
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }

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

        function alertOnSaveFailure() {
            createToast('Save failed', 'danger');
        }

        function updatePurchaseOrderDeliveryMode() {
            return PurchaseOrderService.update({id: $scope.purchaseOrder.id, isSingleIp: true}, 'PATCH');
        }

        function notifyOnSuccess(message) {
            message = message || 'Delivery created';
            createToast(message, 'success');
        }
    });
