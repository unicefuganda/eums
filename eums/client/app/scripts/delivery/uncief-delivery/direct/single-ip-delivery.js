angular.module('SingleIpDirectDelivery', ['ngToast', 'DistributionPlanNode'])
    .controller('SingleIpDirectDeliveryController', function ($scope, PurchaseOrderService, $routeParams, IPService,
                                                              ngToast, DistributionPlanService, DeliveryNode, $q,
                                                              DistributionPlanNodeService) {
        $scope.consignee = {};
        $scope.contact = {};
        $scope.district = {};

        PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item']).then(function (purchaseOrder) {
            PurchaseOrderService.getDetail(purchaseOrder, 'total_value').then(function (totalValue) {
                purchaseOrder.totalValue = totalValue;
            });
            $scope.purchaseOrder = purchaseOrder;
            $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
        });

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
            var canCreateDelivery = !$scope.delivery && totalQuantityShipped;
            var errorMessage = 'Cannot save delivery with zero quantity shipped';
            canCreateDelivery ? createDelivery().then(createDeliveryNodes) : createToast(errorMessage, 'danger');
        };

        function createDelivery() {
            var programme = {programme: $scope.purchaseOrder.programme};
            return DistributionPlanService.createPlan(programme).then(function (createdDelivery) {
                $scope.delivery = createdDelivery;
                return createdDelivery;
            });
        }

        function createDeliveryNodes(createdDelivery) {
            function createNodeFrom(purchaseOrderItem) {
                DistributionPlanNodeService.create(new DeliveryNode({
                    item: purchaseOrderItem,
                    distributionPlan: createdDelivery,
                    consignee: $scope.consignee,
                    location: $scope.district.name,
                    plannedDistributionDate: $scope.deliveryDate,
                    contactPerson: $scope.contact,
                    remark: $scope.remark,
                    track: true,
                    isEndUser: false,
                    treePosition: 'IMPLEMENTING_PARTNER'
                }));
            }

            $scope.purchaseOrderItems.forEach(function (purchaseOrderItem) {
                purchaseOrderItem.quantityShipped && createNodeFrom(purchaseOrderItem);
            });
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }
    });
