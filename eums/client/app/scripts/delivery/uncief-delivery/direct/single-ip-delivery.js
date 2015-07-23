angular.module('SingleIpDirectDelivery', ['ngToast'])
    .controller('SingleIpDirectDeliveryController', function ($scope, PurchaseOrderService, $routeParams, IPService, ngToast, DistributionPlanService, DistributionPlanNodeService, $q) {
        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }

        var formatDateForSave = function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        };

        var saveDelivery = function() {
            var message = 'Delivery Successfully Saved!';
            if(!$scope.distributionPlan) {
                DistributionPlanService.createPlan({programme: $scope.purchaseOrder.programme})
                    .then(function (createdPlan) {
                        $scope.distributionPlan = createdPlan;

                    });
            }
            createToast(message, 'success');
        };

        var saveNodes = function () {
            var saveDeliveryPromises = []
            $scope.purchaseOrderItems.forEach(function (purchaseOrderItem) {
                saveDeliveryPromises.push[saveDeliveryNode(purchaseOrderItem)];
            });

            if ($scope.purchaseOrder.isSingleIp === null) {
                saveDeliveryPromises.push[savePurchaseOrderSingleIPMode()];
            }

            $q.all(saveDeliveryPromises).then(function () {
                createToast(message, 'success');
            });
        };

        function savePurchaseOrderSingleIPMode() {
            var purchaseOrder = $scope.purchaseOrder;
            purchaseOrder.isSingleIp = true;
            var items = [];
            for (var item in $scope.purchaseOrder.purchaseorderitem_set) {
                items.push(item.id);
            }
            purchaseOrder.purchaseorderitem_set = items;
            PurchaseOrderService.update(purchaseOrder);
        }

        var saveDeliveryNode = function (purchaseOrderItem) {
            var deferred = $q.defer();
            var deliveryDate = new Date($scope.deliveryDate);

            if (deliveryDate.toString() === 'Invalid Date') {
                var planDate = $scope.deliveryDate.split('/');
                deliveryDate = new Date(planDate[2], planDate[1] - 1, planDate[0]);
            }

            var  node = {
                consignee: $scope.consignee.id,
                location: $scope.district.id,
                contact_person_id: $scope.contact.id,
                distribution_plan: $scope.distributionPlanId,
                tree_position: 'IMPLEMENTING_PARTNER',
                item: purchaseOrderItem.id,
                targeted_quantity: parseInt(purchaseOrderItem.quantityShipped),
                planned_distribution_date: formatDateForSave(deliveryDate),
                track: false
            };

            DistributionPlanNodeService.create(node).then(function (created) {
                node.id = created.id;
                deferred.resolve(node);
            }, function (response) {
                handleErrors(response, purchaseOrderItem.materialCode);
                deferred.reject();
            });

            return deferred.promise;
        };

        var handleErrors = function (response, materialCode) {
            var message = '';
            var errors = response.data;
            for (var property in errors) {
                message += 'Material: ' + materialCode + ', ' + property + ': ' + errors[property] + '\n';
            }
            $scope.errors = true;
            createToast(message, 'danger');
        };

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

        $scope.save = function() {
            $scope.purchaseOrder.isSingleIp ? saveDelivery() : angular.element('#confirmation-modal').modal();
        };

        $scope.warningAccepted = function() {
            angular.element('#confirmation-modal').modal('hide');
            if(!($scope.contact.id && $scope.consignee.id && $scope.deliveryDate && $scope.district.id)) {
                $scope.errors = true;
                createToast('Cannot save. Please fill out all fields marked in red first', 'danger')
            } else {
                saveDelivery();
            }
        };
    });
