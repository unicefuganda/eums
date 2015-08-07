angular.module('IpItems', ['Item', 'ui.bootstrap'])
    .controller('IpItemsController', function ($scope, $q, ItemService) {
        $scope.items = [];
        $scope.searching = false;

        fetchItems();
        $scope.goToPage = function (page) {
            var urlArgs = {paginate: 'true', page: page};
            if ($scope.searchTerm && $scope.searchTerm.length) {
                urlArgs = Object.merge(urlArgs, {search: $scope.searchTerm});
            }
            ItemService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
            });
        };

        $scope.$watch('searchTerm', function (term) {
            if (term && term.length) {
                $scope.searching = true;
                ItemService.search(term, [], {paginate: true}).then(function (response) {
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

        function fetchItems() {
            ItemService.all([], {paginate: 'true'}).then(function (response) {
                setScopeDataFromResponse(response);
            });
        }

        function setScopeDataFromResponse(response) {
            $scope.items = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }
    });