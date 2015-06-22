//'use strict';
//
//angular.module('NewIpReport', ['PurchaseOrder'])
//    .controller('NewIpDeliveryController', function ($scope, $routeParams, PurchaseOrderService) {
//        $scope.selectedPurchaseOrderItem = {};
//
//        PurchaseOrderService.get($routeParams.purchaseOrderId, ['purchaseorderitem_set.item.unit']).then(function (purchaseOrder) {
//            $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
//            console.log($scope.purchaseOrderItems);
//        });
//
//        $scope.selectPurchaseOrderItem = function () {
//
//        }
//    });
