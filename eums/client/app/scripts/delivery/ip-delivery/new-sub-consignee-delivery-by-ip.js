'use strict';

angular.module('NewSubConsigneeDeliveryByIp', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('NewSubConsigneeDeliveryByIpController', function ($scope, IPService, DeliveryNodeService, $routeParams,
                                                                   DeliveryNode, ngToast, LoaderService, $q) {
        $scope.newDelivery = {track: true};
        $scope.districts = [];
        $scope.errors = false;
        $scope.addingNewDelivery = false;

        var loadPromises = [];
        var itemId = $routeParams.itemId;
        var parentNodeId = $routeParams.parentNodeId;

        loadPromises.push(IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (districtName) {
                return {id: districtName, name: districtName};
            });
            $scope.districtsLoaded = true;
        }));

        var filterParams = {item__item: itemId, parent: parentNodeId};
        loadPromises.push(DeliveryNodeService.filter(filterParams).then(function (nodes) {
            $scope.deliveries = nodes;
        }));

        loadPromises.push(DeliveryNodeService.get(parentNodeId).then(function (parent) {
            $scope.parentNode = parent;
        }));

        $scope.toggleNewDeliveryForm = function(){
            $scope.addingNewDelivery = !$scope.addingNewDelivery;
        };
    });
