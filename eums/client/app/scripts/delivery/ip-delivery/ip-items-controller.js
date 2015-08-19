angular.module('IpItems', ['ConsigneeItem', 'ui.bootstrap'])
    .controller('IpItemsController', function ($scope, $q, ConsigneeItemService, $location) {
        $scope.items = [];
        $scope.searching = false;

        fetchItems();
        $scope.goToPage = function (page) {
            var urlArgs = {page: page};
            if ($scope.searchTerm && $scope.searchTerm.length) {
                urlArgs = Object.merge(urlArgs, {search: $scope.searchTerm});
            }
            ConsigneeItemService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
            });
        };

        $scope.$watch('searchTerm', function (term) {
            if (term && term.length) {
                $scope.searching = true;
                ConsigneeItemService.search(term).then(function (response) {
                    setScopeDataFromResponse(response);
                }).catch(function () {
                    //createToast('Search failed', 'danger');
                }).finally(function () {
                    $scope.searching = false;
                });
            }
            else {
                fetchItems();
            }
        });

        $scope.view = function (item) {
            console.log('item', item);
            $location.path('/item-deliveries/' + item.id);
        };

        function fetchItems() {
            ConsigneeItemService.all().then(function (response) {
                setScopeDataFromResponse(response);
            });
        }

        function setScopeDataFromResponse(response) {
            $scope.items = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }
    });