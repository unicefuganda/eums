'use strict';

angular.module('NewIpDelivery', ['eums.config'])
    .controller('NewIpDeliveryController', function ($scope, IPService, DeliveryNodeService, $routeParams) {
        $scope.districts = [];
        $scope.contact = {};
        $scope.district = {};
        $scope.consignee = {};

        IPService.loadAllDistricts().then(function(response) {
            $scope.districts = response.data.map(function (districtName) {
                return {id: districtName, name: districtName};
            });
            $scope.districtsLoaded = true;
        });

        DeliveryNodeService.filter({item: $routeParams.itemId, balance_greater_than: 0}).then(function(nodes) {
            $scope.deliveries = nodes;
        });

        $scope.addContact = function () {
            $scope.$broadcast('add-contact');
        };

        $scope.$on('contact-saved', function (event, contact) {
            var contactInput = angular.element('#contact-select');
            var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
            contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);

            $scope.contact = contact;
            $scope.contact_person_id = contact._id;

            event.stopPropagation();
        });

        $scope.addConsignee = function(){
            $scope.$broadcast('add-consignee');
        };

        $scope.$on('consignee-saved', function (event, consignee) {
            $scope.consignee = consignee;
            $scope.$broadcast('set-consignee', consignee);
            event.stopPropagation();
        });
    });