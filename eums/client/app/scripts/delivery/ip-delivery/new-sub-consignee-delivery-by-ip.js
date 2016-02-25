'use strict';

angular.module('NewSubConsigneeDeliveryByIp', ['eums.config', 'ngToast', 'SystemSettingsService', 'SysUtils'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('NewSubConsigneeDeliveryByIpController', function ($scope, $q, IPService, DeliveryNodeService, $routeParams,
                                                                   DeliveryNode, ngToast, LoaderService, $window, $timeout,
                                                                   ItemService, ContactService, SystemSettingsService,
                                                                   SysUtilsService) {
        var loadPromises = [];

        $scope.newDelivery = new DeliveryNode({track: true});
        $scope.districts = [];
        $scope.errors = false;
        $scope.searching = false;
        $scope.addingNewDelivery = false;
        $scope.itemId = $routeParams.itemId;
        var parentNodeId = $routeParams.parentNodeId;
        var filterParams = {item__item: $scope.itemId, parent: parentNodeId, paginate: true};

        init();

        loadPromises.push(IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (districtName) {
                return {id: districtName, name: districtName};
            });
            $scope.districtsLoaded = true;
        }));

        loadPromises.push(ItemService.get($scope.itemId).then(function (item) {
            $scope.item = item;
        }));

        loadPromises.push(fetchNodes());

        loadPromises.push(loadParentNode());

        $scope.$watch('searchTerm', function (term) {
            if (term && term.length) {
                $scope.searching = true;
                DeliveryNodeService.search(term, [], filterParams).then(function (response) {
                    setScopeDataFromResponse(response);
                }).finally(function () {
                    $scope.searching = false;
                });
            }
            else {
                fetchNodes();
            }
        });

        $scope.$on('contact-saved', function (event, contact) {
            var contactInput = angular.element('#contact-select');
            var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
            contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);

            $scope.newDelivery.contact = contact;
            $scope.newDelivery.contact_person_id = contact._id;

            event.stopPropagation();
        });

        $scope.$on('consignee-saved', function (event, consignee) {
            $scope.newDelivery.consignee = consignee;
            $scope.$broadcast('set-consignee', consignee);
            event.stopPropagation();
        });

        $scope.toggleNewDeliveryForm = function () {
            resetNewDeliveryForm();
            $scope.addingNewDelivery = !$scope.addingNewDelivery;
        };

        $scope.createNewDelivery = function () {
            $scope.newDelivery.deliveryDate = SysUtilsService.formatDateToYMD($scope.newDelivery.deliveryDate);

            if (scopeDataIsValid()) {
                save();
            }
            else {
                $scope.errors = true;
                createToast('Cannot save. Please fill out or fix values for all fields marked in red', 'danger');
            }
        };

        $scope.addContact = function () {
            $scope.$broadcast('add-contact');
        };

        $scope.goToPage = function (page) {
            var urlArgs = {page: page};
            if ($scope.searchTerm && $scope.searchTerm.length) {
                urlArgs = Object.merge(urlArgs, {search: $scope.searchTerm});
            }
            fetchNodes(urlArgs);
        };

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.addConsignee = function () {
            $scope.$broadcast('add-consignee');
        };

        function init() {
            var promises = [];
            promises.push(SystemSettingsService.getSettingsWithDefault());
            $q.all(promises).then(function (returns) {
                $scope.systemSettings = returns[0];
            });
        }

        function scopeDataIsValid() {
            return requiredFieldsAreFilled() && quantityIsValid();
        }

        function requiredFieldsAreFilled() {
            return $scope.newDelivery.location
                && $scope.newDelivery.contact_person_id
                && $scope.newDelivery.consignee
                && $scope.newDelivery.deliveryDate
                && $scope.newDelivery.quantity;
        }

        function quantityIsValid() {
            return $scope.newDelivery.quantity <= $scope.parentNode.balance;
        }

        function createToast(message, klass) {
            ngToast.create({content: message, class: klass});
        }

        function save() {
            $scope.newDelivery.item = $scope.parentNode.item;
            $scope.newDelivery.distributionPlan = $scope.parentNode.distributionPlan;
            $scope.newDelivery.parents = [
                {
                    id: $routeParams.parentNodeId,
                    quantity: $scope.newDelivery.quantity
                }
            ];
            DeliveryNodeService.create($scope.newDelivery, {changeCaseOnResponse: true}).then(function (createdDelivery) {
                ContactService.get(createdDelivery.contactPersonId).then(function (contact) {
                    createdDelivery.contactPerson = contact;
                    $scope.deliveries.add(createdDelivery, 0);
                });
                resetDeliveryData();
                createToast('Delivery Successfully Created', 'success');
            });
        }

        function fetchNodes(extraArgs) {
            var requestArgs = extraArgs ? Object.merge(extraArgs, filterParams) : filterParams;
            DeliveryNodeService.filter(requestArgs, ['contact_person_id']).then(function (paginatedNodes) {
                LoaderService.showLoader();
                setScopeDataFromResponse(paginatedNodes);
                LoaderService.hideLoader();
            });
        }

        function loadParentNode() {
            return DeliveryNodeService.get(parentNodeId).then(function (parent) {
                $scope.parentNode = parent;
                $scope.parentNode.consignee_name = parent.consigneeName;
                DeliveryNodeService.getLineage($scope.parentNode).then(function (parents) {
                    $scope.deliveryLineage = parents;
                    $scope.deliveryLineage.push($scope.parentNode);
                    $scope.deliveryLineage.sort(function (a, b) {
                        return a.id - b.id;
                    });
                });
            });
        }

        function resetDeliveryData() {
            loadParentNode();
            resetNewDeliveryForm();
        }

        function resetNewDeliveryForm() {
            $scope.newDelivery = new DeliveryNode({track: true});
            $scope.errors = false;
            $scope.$broadcast('clear-consignee');
            $scope.$broadcast('clear-contact');
            $scope.$broadcast('clear-list');
        }

        function setScopeDataFromResponse(paginatedNodes) {
            $scope.deliveries = paginatedNodes.results;
            $scope.pageSize = paginatedNodes.pageSize;
            $scope.count = paginatedNodes.count;
        }
    })
    .filter('capitalize', function () {
        'use strict';
        return function (token) {
            return token.first().toUpperCase() + token.slice(1);
        }
    });
