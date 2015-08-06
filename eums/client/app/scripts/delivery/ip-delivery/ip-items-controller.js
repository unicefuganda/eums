angular.module('IpItems', ['Item', 'ui.bootstrap'])
    .controller('IpItemsController', function ($scope, $q, ItemService) {
        $scope.items = [];

        ItemService.all([], {paginate: 'true'}).then(function (response) {
            setScopeDataFromResponse(response);
        });

        $scope.goToPage = function (page) {
            var urlArgs = {paginate: 'true', page: page};
            //if ($scope.searchTerm && $scope.searchTerm.length) {
            //    urlArgs = Object.merge(urlArgs, {search: $scope.searchTerm});
            //}
            ItemService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
            }).catch(function () {
                //createToast('Failed to load consignees', 'danger');
            });
            //}).finally(hideLoader);
        };

        function setScopeDataFromResponse(response) {
            $scope.items = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }
    });