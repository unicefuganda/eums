'use strict';


angular.module('DirectDeliveryIpChoice', ['PurchaseOrder', 'Loader'])
    .controller('DirectDeliveryIpChoiceController', function ($scope, $location, $routeParams, PurchaseOrderService, LoaderService) {
        
        var rootPath = '/direct-delivery/new/';

        LoaderService.showLoader();

        PurchaseOrderService.get($routeParams.purchaseOrderId).then(function (purchaseOrder) {

            $scope.selectedPurchaseOrder = purchaseOrder;

            // Note that isSingleIp can be null when ip choice has not been decided
            if (purchaseOrder.isSingleIp) {
                $location.path(rootPath + purchaseOrder.id + '/single');
            }
            if (purchaseOrder.isSingleIp === false) {
                $location.path(rootPath + purchaseOrder.id + '/multiple');
            }
            LoaderService.hideLoader();
        });

        $scope.showSingleIpMode = function () {
            $location.path(rootPath + $scope.selectedPurchaseOrder.id + '/single');
        };

        $scope.showMultipleIpMode = function () {
            $location.path(rootPath + $scope.selectedPurchaseOrder.id + '/multiple');
        };
    });