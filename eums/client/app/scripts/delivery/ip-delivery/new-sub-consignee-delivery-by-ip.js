'use strict';

angular.module('NewSubConsigneeDeliveryByIp', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('NewSubConsigneeDeliveryByIpController', function ($scope, IPService, DeliveryNodeService, $routeParams,
                                                                   DeliveryNode, ngToast, LoaderService, $q, ItemService,
                                                                   ConsigneeItemService, $location) {
        $scope.newDelivery = {};
        $scope.districts = [];
        $scope.deliveries = [
            {quantityIn: 5, isEndUser: true},
            {deliveryDate: '12/3/2015'},
            {consigneeName: 'Wakiso'},
            {contactPerson: 'Kagu', isEndUser: true},
            {location: 'Kapchorwa'}
        ];
    });
