angular.module('IpItemDeliveries', ['DeliveryNode', 'ui.bootstrap', 'ngToast'])
    .controller('IpItemDeliveriesController', function ($scope, DeliveryNodeService, ItemService, $routeParams,
                                                        ConsigneeItemService, LoaderService, $q, ngToast) {

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass, maxNumber: 1, dismissOnTimeout: true});
        }

        $scope.deliveryNodes = [];
        $scope.searching = false;

        var itemId = $routeParams.itemId;
        var loadPromises = [];

        LoaderService.showLoader();
        loadPromises.push(ItemService.get(itemId).then(function (item) {
            $scope.item = item;
        }));

        loadPromises.push(ConsigneeItemService.filter({item: itemId}).then(function (response) {
            $scope.quantityAvailable = response.results.first().availableBalance;
        }));

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
                LoaderService.showLoader();
                DeliveryNodeService.search(term, fieldsToBuild, filterFields).then(function (response) {
                    setScopeDataFromResponse(response);
                }).catch(function () {
                    createToast('search failed', 'danger');
                }).finally(function () {
                    $scope.searching = false;
                    LoaderService.hideLoader();
                });
            }
            else {
                loadPromises.push(fetchNodes());
            }
        });

        $q.all(loadPromises).catch(function () {
            createToast('failed to load deliveries', 'danger');
        }).finally(LoaderService.hideLoader);

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