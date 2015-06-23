'use strict';


angular.module('DirectDeliveryManagement', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives'])
    .controller('DirectDeliveryManagementController', function ($scope, $location, DistributionPlanService, ProgrammeService, PurchaseOrderService, $routeParams) {

        PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item.unit']).then(function (purchaseOrder) {
            $scope.selectedPurchaseOrder = purchaseOrder;
            $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
        });

        $scope.showSingleIpMode = function() {
            $scope.inSingleIpMode = true;
            $scope.inMultipleIpMode = false;
        }

        $scope.showMultipleIpMode = function() {
            $scope.inMultipleIpMode = true;
            $scope.inSingleIpMode = false;
        }

    });

