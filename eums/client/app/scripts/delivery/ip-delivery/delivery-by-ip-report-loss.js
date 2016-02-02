'use strict';

angular.module('DeliveryByIpReportLoss', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('DeliveryByIpReportLossController', function ($scope, $routeParams, ngToast, $q, ConsigneeItemService) {
        var itemId = $routeParams.itemId;

        function init() {
            ConsigneeItemService.filter({item: itemId}).then(function (response) {
                var item = response.results.first();
                $scope.consigneeItem = {
                    itemId: item.item,
                    itemDescription: item.itemDescription,
                    quantityAvailable: item.availableBalance
                };
            });
        }

        init();
    });