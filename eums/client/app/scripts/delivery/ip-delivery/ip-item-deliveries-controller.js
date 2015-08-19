angular.module('IpItemDeliveries', ['DeliveryNode', 'ui.bootstrap'])
    .controller('IpItemDeliveriesController', function ($scope, DeliveryNodeService, ItemService, $routeParams) {
        $scope.deliveryNodes = [];
        $scope.searching = false;

        var itemId = $routeParams.itemId;
        ItemService.get(itemId).then(function (item) {
            $scope.item = item;
        });

        var fieldsToBuild = ['contact_person_id'];
        var filterFields = {consignee_deliveries_for_item: itemId, paginate: true};

        $scope.goToPage = function (page) {
            var filterAndUrlArgs = Object.merge({page: page}, filterFields);
            if ($scope.searchTerm && $scope.searchTerm.length) {
                filterAndUrlArgs = Object.merge(filterAndUrlArgs, {search: $scope.searchTerm});
            }
            DeliveryNodeService.filter(filterAndUrlArgs, fieldsToBuild).then(function (response) {
                setScopeDataFromResponse(response);
            });
        };

        $scope.$watch('searchTerm', function (term) {
            if (term && term.length) {
                $scope.searching = true;
                DeliveryNodeService.search(term, fieldsToBuild, filterFields).then(function (response) {
                    setScopeDataFromResponse(response);
                }).finally(function () {
                    $scope.searching = false;
                });
            }
            else {
                fetchNodes();
            }
        });

        function setScopeDataFromResponse(response) {
            $scope.deliveryNodes = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }

        function fetchNodes() {

            DeliveryNodeService.filter(filterFields, fieldsToBuild).then(function (response) {
                setScopeDataFromResponse(response);
            });
        }
    });
