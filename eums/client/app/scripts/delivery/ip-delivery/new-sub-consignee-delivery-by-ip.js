'use strict';

angular.module('NewSubConsigneeDeliveryByIp', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('NewSubConsigneeDeliveryByIpController', function ($scope, IPService, DeliveryNodeService, $routeParams,
                                                                   DeliveryNode, ngToast, LoaderService, $q) {
        $scope.newDelivery = new DeliveryNode({track: true});
        $scope.districts = [];
        $scope.errors = false;
        $scope.searching = false;
        $scope.addingNewDelivery = false;

        var loadPromises = [];
        $scope.itemId = $routeParams.itemId;
        var parentNodeId = $routeParams.parentNodeId;
        var filterParams = {item__item: $scope.itemId, parent: parentNodeId, paginate: true};

        loadPromises.push(IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (districtName) {
                return {id: districtName, name: districtName};
            });
            $scope.districtsLoaded = true;
        }));

        loadPromises.push(fetchNodes());

        loadPromises.push(loadParentNode());

        $scope.toggleNewDeliveryForm = function () {
            resetNewDeliveryForm();
            $scope.addingNewDelivery = !$scope.addingNewDelivery;
        };

        $scope.createNewDelivery = function () {
            $scope.newDelivery.item = $scope.parentNode.item;
            $scope.newDelivery.parents = [{
                id: $routeParams.parentNodeId,
                quantity: $scope.newDelivery.quantity
            }];
            DeliveryNodeService.create($scope.newDelivery).then(function (createdDelivery) {
                $scope.deliveries.add(createdDelivery, 0);
                resetDeliveryData()
            });
        };

        $scope.addContact = function () {
            $scope.$broadcast('add-contact');
        };

        $scope.$on('contact-saved', function (event, contact) {
            var contactInput = angular.element('#contact-select');
            var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
            contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);

            $scope.newDelivery.contact = contact;
            $scope.newDelivery.contact_person_id = contact._id;

            event.stopPropagation();
        });

        $scope.addConsignee = function () {
            $scope.$broadcast('add-consignee');
        };

        $scope.$on('consignee-saved', function (event, consignee) {
            $scope.newDelivery.consignee = consignee;
            $scope.$broadcast('set-consignee', consignee);
            event.stopPropagation();
        });

        $scope.$watch('newDelivery.deliveryDate', function (val) {
            if (val) {
                var earlierMoment = moment(new Date($scope.newDelivery.deliveryDate));
                $scope.newDelivery.deliveryDate = earlierMoment.format('YYYY-MM-DD');
            }
        });

        $scope.goToPage = function (page) {
            var urlArgs = {page: page};
            if ($scope.searchTerm && $scope.searchTerm.length) {
                urlArgs = Object.merge(urlArgs, {search: $scope.searchTerm});
            }
            fetchNodes(urlArgs);
        };


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

        function fetchNodes(extraArgs) {
            var requestArgs = extraArgs ? Object.merge(extraArgs, filterParams): filterParams;
            DeliveryNodeService.filter(requestArgs).then(function (paginatedNodes) {
                setScopeDataFromResponse(paginatedNodes);
            });
        }

        function loadParentNode() {
            return DeliveryNodeService.get(parentNodeId).then(function (parent) {
                $scope.parentNode = parent;
            });
        }

        function resetDeliveryData() {
            loadParentNode();
            resetNewDeliveryForm();
        }

        function resetNewDeliveryForm() {
            $scope.newDelivery = new DeliveryNode({track: true});
            $scope.$broadcast('clear-consignee');
            $scope.$broadcast('clear-contact');
            $scope.$broadcast('clear-list');
        }

        function setScopeDataFromResponse(paginatedNodes) {
            $scope.deliveries = paginatedNodes.results;
            $scope.pageSize = paginatedNodes.pageSize;
            $scope.count = paginatedNodes.count;
        }
    });