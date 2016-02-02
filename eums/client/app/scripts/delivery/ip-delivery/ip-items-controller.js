angular.module('IpItems', ['ConsigneeItem', 'ui.bootstrap'])
    .controller('IpItemsController', function ($scope, $q, ConsigneeItemService, UserService) {
        $scope.currentUser = {};
        $scope.items = [];
        $scope.searching = false;

        init();

        $scope.$watch('searchTerm', function (term) {
            if (term && term.length) {
                $scope.searching = true;
                searchItems(term);
            }
            else {
                loadItems();
            }
        });

        $scope.goToPage = function (page) {
            var urlArgs = {page: page};
            if ($scope.searchTerm && $scope.searchTerm.length) {
                urlArgs = Object.merge(urlArgs, {search: $scope.searchTerm});
            }
            ConsigneeItemService.all([], urlArgs).then(function (response) {
                setScopeDataFromResponse(response);
            });
        };

        function init() {
            var promises = [];
            promises.push(loadUserPermissions());
            promises.push(loadCurrentUser());
            $q.all(promises).then(function () {
                loadItems();
            });
        }

        function loadUserPermissions() {
            return UserService.retrieveUserPermissions().then(function (permissions) {
                $scope.userPermissions = permissions;
                UserService.hasPermission("eums.add_distributionplannode", $scope.userPermissions).then(function (result) {
                    $scope.can_add_distributionplan_node = result;
                });
                UserService.hasPermission("eums.change_distributionplannode", $scope.userPermissions).then(function (result) {
                    $scope.can_change_distributionplan_node = result;
                });
            });
        }

        function loadCurrentUser() {
            return UserService.getCurrentUser().then(function (user) {
                $scope.currentUser = user;
            });
        }

        function loadItems() {
            ConsigneeItemService.all().then(function (response) {
                setScopeDataFromResponse(response);
            });
        }

        function searchItems(term) {
            ConsigneeItemService.search(term).then(function (response) {
                setScopeDataFromResponse(response);
            }).catch(function () {
                //createToast('Search failed', 'danger');
            }).finally(function () {
                $scope.searching = false;
            });
        }

        function setScopeDataFromResponse(response) {
            $scope.items = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }
    });