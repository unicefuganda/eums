angular.module('IpItems', ['Item'])
    .controller('IpItemsController', function($scope, $q, ItemService) {
        $scope.items = [];

        ItemService.all([], {paginate: 'true'}).then(function(response) {
           setScopeDataFromResponse(response);
        });

        function setScopeDataFromResponse(response) {
            $scope.items = response.results;
            $scope.count = response.count;
        }
    });