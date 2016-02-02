'use strict';

angular.module('DeliveryByIpReportLoss', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('DeliveryByIpReportLossController', function ($scope, $routeParams, ngToast, $q, ItemService) {
        var itemId = $routeParams.itemId;

        function init() {
            ItemService.get(itemId).then(function (item) {
                $scope.item = item;
            })
        }

        init();
    });