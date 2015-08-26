'use strict';

angular.module('NewIpDelivery', ['eums.config'])
    .controller('NewIpDeliveryController', function ($scope, IPService, DeliveryNodeService, $routeParams, DeliveryNode) {
        $scope.districts = [];
        $scope.newDelivery = new DeliveryNode({track: true});

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (districtName) {
                return {id: districtName, name: districtName};
            });
            $scope.districtsLoaded = true;
        });

        DeliveryNodeService.filter({item__item: $routeParams.itemId, is_distributable: true}).then(function (nodes) {
            $scope.deliveries = nodes;
        });

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
            var non_zero_quantity_deliveries = $scope.deliveries.filter(function(delivery) {
                return delivery.quantityShipped > 0;
            });
            var parents = non_zero_quantity_deliveries.map(function(delivery) {
                return {id: delivery.id, quantity: delivery.quantityShipped};
            });

            $scope.newDelivery.item = non_zero_quantity_deliveries.first().item;
            $scope.newDelivery.parents = parents;
            DeliveryNodeService.create($scope.newDelivery);
        };
    });