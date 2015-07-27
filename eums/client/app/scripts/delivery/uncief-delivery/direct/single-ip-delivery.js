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

        $scope.save = function () {
            var someInputsAreEmpty = !($scope.contact.id && $scope.consignee.id && $scope.deliveryDate && $scope.district.id);
            var someItemsAreInvalid = $scope.purchaseOrderItems.any(function (item) {
                return item.isInvalid();
            });

            if (someInputsAreEmpty || someItemsAreInvalid) {
                $scope.errors = true;
                createToast('Cannot save. Please fill out all fields marked in red first', 'danger')
            }
            else {
                $scope.purchaseOrder.isSingleIp ? saveDelivery() : angular.element('#confirmation-modal').modal();
            }
        };

        $scope.warningAccepted = function () {
            angular.element('#confirmation-modal').modal('hide');
            saveDelivery();
        };

        var saveDelivery = function () {
            var totalQuantityShipped = $scope.purchaseOrderItems.sum(function (item) {
                return item.quantityShipped || 0;
            });
            if (!$scope.delivery && totalQuantityShipped) {
                showLoader();
                createDelivery()
                    .then(createDeliveryNodes)
                    .then(updatePurchaseOrderDeliveryMode)
                    .then(loadOrderData)
                    .then(notifyOnSuccess)
                    .catch(alertOnSaveFailure)
                    .finally(hideLoader)
            }
            else if (!totalQuantityShipped) {
                createToast('Cannot save delivery with zero quantity shipped', 'danger');
            }
        };

        function showLoader() {
            angular.element('#loading').modal();
        }

        function hideLoader() {
            angular.element('#loading').modal('hide');
        }

        function alertOnSaveFailure() {
            createToast('Save failed', 'danger');
        }

        function updatePurchaseOrderDeliveryMode() {
            return PurchaseOrderService.update({id: $scope.purchaseOrder.id, isSingleIp: true}, 'PATCH');
        }

        function notifyOnSuccess() {
            createToast('Delivery created', 'success');
        }

        function createDelivery() {
            var deliveryFields = {
                programme: $scope.purchaseOrder.programme,
                consignee: $scope.consignee.id,
                location: $scope.district.id,
                delivery_date: moment(new Date($scope.deliveryDate)).format('YYYY-MM-DD'),
                contact_person_id: $scope.contact.id,
                remark: $scope.remark,
                track: true
            };
            return DistributionPlanService.createPlan(deliveryFields).then(function (createdDelivery) {
                $scope.delivery = createdDelivery;
                return createdDelivery;
            });
        }

        function loadPurchaseOrderValue(purchaseOrder) {
            PurchaseOrderService.getDetail(purchaseOrder, 'total_value').then(function (totalValue) {
                purchaseOrder.totalValue = totalValue;
                hideLoader();
            });
        }

        function loadOrderData() {
            showLoader();
            PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item'])
                .then(function (purchaseOrder) {
                    loadPurchaseOrderValue(purchaseOrder);
                    loadPurchaseOrderDeliveries(purchaseOrder);
                    $scope.purchaseOrder = purchaseOrder;
                    $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
                });
        }

        function loadPurchaseOrderDeliveries (purchaseOrder) {
            PurchaseOrderService.getDetail(purchaseOrder, 'deliveries').then (function (deliveries) {
                $scope.trackedDeliveries = deliveries.filter(function(delivery) {
                    return delivery.track;
                });
            })
        }

        function createDeliveryNodes(createdDelivery) {
            function createNodeFrom(purchaseOrderItem) {
                return DistributionPlanNodeService.create(new DeliveryNode({
                    item: purchaseOrderItem,
                    targetedQuantity: purchaseOrderItem.quantityShipped,
                    distributionPlan: createdDelivery,
                    consignee: $scope.consignee,
                    location: $scope.district.id,
                    deliveryDate: moment(new Date($scope.deliveryDate)).format('YYYY-MM-DD'),
                    contactPerson: $scope.contact,
                    remark: $scope.remark,
                    track: true,
                    isEndUser: false,
                    treePosition: 'IMPLEMENTING_PARTNER'
                }));
            }

            var createNodePromises = [];
            $scope.purchaseOrderItems.forEach(function (purchaseOrderItem) {
                purchaseOrderItem.quantityShipped && createNodePromises.push(createNodeFrom(purchaseOrderItem));
            });
            return $q.all(createNodePromises);
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }
    });
