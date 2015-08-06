'use strict';

angular.module('IpDelivery', ['eums.config', 'ngTable', 'siTable', 'Loader'])
    .controller('IpDeliveryController', function ($scope, DeliveryService, LoaderService) {
        LoaderService.showLoader();

        $scope.deliveries = [];

        DeliveryService.all().then(function(deliveries){
            $scope.deliveries = deliveries;
            LoaderService.hideLoader();
        });
    });


