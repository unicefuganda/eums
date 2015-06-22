'use strict';

angular.module('IpDelivery', ['DistributionPlan', 'ngTable', 'siTable', 'DistributionPlanNode', 'ui.bootstrap', 'Consignee',
    'PurchaseOrder', 'PurchaseOrderItem', 'eums.ip', 'ngToast', 'Contact', 'User', 'Item'])
    .controller('NewIpDeliveryController', function ($scope, $location, $q, $routeParams, DistributionPlanService,
                                                  DistributionPlanNodeService, ConsigneeService, PurchaseOrderService) {
        $scope.selectedPurchaseOrderItem = {};

        PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item.unit']).then(function(purchaseOrder) {
            $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
        });

        $scope.selectPurchaseOrderItem = function() {

        }
    }
);