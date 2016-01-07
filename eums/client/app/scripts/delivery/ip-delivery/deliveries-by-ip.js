angular.module('DeliveriesByIp', ['DeliveryNode', 'ui.bootstrap', 'ngToast', 'NewDeliveryByIp'])
    .controller('DeliveriesByIpController', function ($scope, DeliveryNodeService, ItemService, $routeParams,
                                                      ConsigneeItemService, LoaderService, $q, ngToast) {

        $scope.deliveryNodes = [];
        $scope.searching = false;

        $scope.itemId = $routeParams.itemId;
        var loadPromises = [];

        LoaderService.showLoader();
        loadPromises.push(ItemService.get($scope.itemId).then(function (item) {
            $scope.item = item;
        }));

        loadPromises.push(ConsigneeItemService.filter({item: $scope.itemId}).then(function (response) {
            $scope.quantityAvailable = response.results.first().availableBalance;
        }));

        var fieldsToBuild = ['contact_person_id'];
        var filterFields = {consignee_deliveries_for_item: $scope.itemId, paginate: true};

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
                }).catch(function () {
                    createToast('search failed', 'danger');
                }).finally(function () {
                    $scope.searching = false;
                });
            }
            else {
                loadPromises.push(DeliveryNodeService.filter(filterFields, fieldsToBuild).then(function (response) {
                    setScopeDataFromResponse(response);
                }));
            }
        });

        $q.all(loadPromises).catch(function () {
            createToast('failed to load deliveries', 'danger');
        }).finally(LoaderService.hideLoader);

        $scope.showAdditionalRemarks = function (msg) {
            $scope.additional_remarks = msg;
            LoaderService.showModal("additional-remarks-modal-dialog");
        };

        function setScopeDataFromResponse(response) {
            $scope.deliveryNodes = response.results;
            $scope.count = response.count;
            $scope.pageSize = response.pageSize;
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass, maxNumber: 1, dismissOnTimeout: true});
        }
    });