angular.module('IpItems', ['Item'])
    .controller('IpItemsController', function($scope, $q, ItemService) {
        $scope.items = [];

        ItemService.all().then(function(items) {
           $scope.items = items;
        });
    });