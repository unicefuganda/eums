'use strict';

angular.module('NewSubConsigneeDeliveryByIp', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('NewSubConsigneeDeliveryByIpController', function ($scope, IPService, DeliveryNodeService, $routeParams,
                                                                   DeliveryNode, ngToast, LoaderService, $q) {
        $scope.newDelivery = new DeliveryNode({track: true});
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

        $scope.toggleNewDeliveryForm = function () {
            $scope.addingNewDelivery = !$scope.addingNewDelivery;
        };

        $scope.createNewDelivery = function () {
            $scope.newDelivery.item = $scope.parentNode.item;
            $scope.newDelivery.parents = [{
                id: $routeParams.parentNodeId,
                quantity: $scope.newDelivery.quantity
            }];
            DeliveryNodeService.create($scope.newDelivery).then(function(createdDelivery) {
                $scope.deliveries.add(createdDelivery, 0);
                $scope.newDelivery = new DeliveryNode({track: true});
            });
        };

        $scope.$watch('newDelivery.deliveryDate', function (val) {
            if (val) {
                var earlierMoment = moment(new Date($scope.newDelivery.deliveryDate));
                $scope.newDelivery.deliveryDate = earlierMoment.format('YYYY-MM-DD');
            }
        });
    });
