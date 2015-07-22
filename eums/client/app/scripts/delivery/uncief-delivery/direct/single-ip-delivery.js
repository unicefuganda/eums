angular.module('SingleIpDirectDelivery', ['ngToast'])
    .controller('SingleIpDirectDeliveryController', function ($scope, PurchaseOrderService, $routeParams, IPService, ngToast) {
        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }
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
            $scope.purchaseOrder.isSingleIp ? console.log() : angular.element('#confirmation-modal').modal();
        };

        $scope.warningAccepted = function() {
            angular.element('#confirmation-modal').modal('hide');
            if(!($scope.contact.id && $scope.consignee.id && $scope.deliveryDate && $scope.district.id)) {
                $scope.errors = true;
                createToast('Cannot save. Please fill out all fields marked in red first', 'danger')
            }
        };
    });
