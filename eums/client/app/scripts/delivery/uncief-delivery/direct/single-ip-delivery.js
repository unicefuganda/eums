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
            $scope.purchaseOrder.isSingleIp ? saveDelivery() : angular.element('#confirmation-modal').modal();
        };

        $scope.warningAccepted = function () {
            angular.element('#confirmation-modal').modal('hide');
            if (!($scope.contact.id && $scope.consignee.id && $scope.deliveryDate && $scope.district.id)) {
                $scope.errors = true;
                createToast('Cannot save. Please fill out all fields marked in red first', 'danger')
            } else {
                saveDelivery();
            }
        };

        var saveDelivery = function () {
            var totalQuantityShipped = $scope.purchaseOrderItems.sum(function (item) {
                return item.quantityShipped || 0;
            });
            if (!$scope.delivery && totalQuantityShipped) {
                showLoader();
                createDelivery()
                    .then(createDeliveryNodes)
                    .then(updatePurchaseOrder)
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

        function updatePurchaseOrder() {
            return PurchaseOrderService.update({id: $scope.purchaseOrder.id, isSingleIp: true}, 'PATCH');
        }

        function notifyOnSuccess() {
            createToast('Delivery created', 'success');
        }

        function createDelivery() {
            var programme = {programme: $scope.purchaseOrder.programme};
            return DistributionPlanService.createPlan(programme).then(function (createdDelivery) {
                $scope.delivery = createdDelivery;
                return createdDelivery;
            });
        }

        function loadOrderData() {
            showLoader();
            PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item']).then(function (purchaseOrder) {
                PurchaseOrderService.getDetail(purchaseOrder, 'total_value').then(function (totalValue) {
                    purchaseOrder.totalValue = totalValue;
                    hideLoader();
                });
                $scope.purchaseOrder = purchaseOrder;
                $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
            });
        }

        function createDeliveryNodes(createdDelivery) {
            function createNodeFrom(purchaseOrderItem) {
                return DistributionPlanNodeService.create(new DeliveryNode({
                    item: purchaseOrderItem,
                    targetedQuantity: purchaseOrderItem.quantityShipped,
                    distributionPlan: createdDelivery,
                    consignee: $scope.consignee,
                    location: $scope.district.id,
                    plannedDistributionDate: moment(new Date($scope.deliveryDate)).format('YYYY-MM-DD'),
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
