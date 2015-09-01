'use strict';

function NewDeliveryByIpBase($scope, IPService, DeliveryNodeService, $routeParams, DeliveryNode, ngToast,
                             LoaderService, $q, ItemService, ConsigneeItemService, $location) {
    $scope.districts = [];
    $scope.newDelivery = new DeliveryNode({track: true});
    $scope.errors = false;
    LoaderService.showLoader();

    var loadPromises = [];
    var itemId = $routeParams.itemId;

    loadPromises.push(IPService.loadAllDistricts().then(function (response) {
        $scope.districts = response.data.map(function (districtName) {
            return {id: districtName, name: districtName};
        });
        $scope.districtsLoaded = true;
    }));

    loadPromises.push(ItemService.get(itemId).then(function (item) {
        $scope.item = item;
    }));

    loadPromises.push(ConsigneeItemService.filter({item: itemId}).then(function (response) {
        $scope.quantityAvailable = response.results.first().availableBalance;
    }));

    loadPromises.push(DeliveryNodeService.filter({
        item__item: $routeParams.itemId,
        is_distributable: true
    }).then(function (nodes) {
        $scope.deliveries = nodes;
    }));

    $q.all(loadPromises).catch(function () {
        createToast('failed to load deliveries', 'danger');
    }).finally(LoaderService.hideLoader);

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

    $scope.$watch('deliveries', function (deliveries) {
        if (deliveries) {
            $scope.totalQuantityShipped = deliveries.reduce(function (acc, delivery) {
                acc.quantityShipped += delivery.quantityShipped || 0;
                return acc;
            }, {quantityShipped: 0}).quantityShipped;
        }
    }, true);

    $scope.$watch('newDelivery.deliveryDate', function (val) {
        if (val) {
            var earlierMoment = moment(new Date($scope.newDelivery.deliveryDate));
            $scope.newDelivery.deliveryDate = earlierMoment.format('YYYY-MM-DD');
        }
    });

    $scope.save = function () {
        var parentDeliveries = $scope.deliveries.filter(function (delivery) {
            return delivery.quantityShipped > 0;
        });
        $scope.newDelivery.parents = parentDeliveries.map(function (delivery) {
            return {id: delivery.id, quantity: delivery.quantityShipped};
        });

        if (parentDeliveries.length && scopeDataIsValid(parentDeliveries)) {
            LoaderService.showLoader();
            $scope.newDelivery.item = parentDeliveries.first().item;
            createNewDelivery();
        }
        else {
            $scope.errors = true;
            createToast('Cannot save. Please fill out or fix values for all fields marked in red', 'danger');
        }
    };

    function createNewDelivery() {
        DeliveryNodeService.create($scope.newDelivery).then(function () {
            createToast('Delivery Successfully Created', 'success');
            $location.path('/deliveries-by-ip/' + $routeParams.itemId);
        }).catch(function () {
            createToast('Failed to save delivery', 'danger');
        }).finally(function () {
            LoaderService.hideLoader();
        });
    }

    function scopeDataIsValid(parentDeliveries) {
        return requiredFieldsAreFilled() && allQuantitiesAreValid() && deliveriesAreFromOneOrder(parentDeliveries);
    }

    function requiredFieldsAreFilled() {
        return $scope.newDelivery.location
            && $scope.newDelivery.contact_person_id
            && $scope.newDelivery.consignee
            && $scope.newDelivery.deliveryDate;
    }

    function allQuantitiesAreValid() {
        return !$scope.deliveries.any(function (delivery) {
            return delivery.quantityShipped > delivery.balance;
        });
    }

    function deliveriesAreFromOneOrder(parentDeliveries) {
        var parentDeliveryOrderHashes = parentDeliveries.map(function (delivery) {
            return delivery.orderNumber + delivery.orderType;
        });
        return parentDeliveryOrderHashes.unique().length == 1;
    }

    function createToast(message, klass) {
        ngToast.create({content: message, class: klass});
    }
}

function NewDeliveryByIpController($injector, $scope, IPService, DeliveryNodeService, $routeParams, DeliveryNode,
                                   ngToast, LoaderService, $q, ItemService, ConsigneeItemService, $location) {
    $injector.invoke(NewDeliveryByIpBase, this, {
        $scope: $scope,
        $location: $location,
        $q: $q,
        $routeParams: $routeParams,
        ngToast: ngToast,
        IPService: IPService,
        DeliveryNodeService: DeliveryNodeService,
        DeliveryNode: DeliveryNode,
        LoaderService: LoaderService,
        ItemService: ItemService,
        ConsigneeItemService: ConsigneeItemService
    });
}

angular.module('NewDeliveryByIp', ['eums.config', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('NewDeliveryByIpController', NewDeliveryByIpController);