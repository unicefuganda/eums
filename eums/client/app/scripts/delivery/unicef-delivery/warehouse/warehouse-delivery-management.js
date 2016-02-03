'use strict';

angular.module('WarehouseDeliveryManagement', ['Delivery', 'ngTable', 'siTable', 'DeliveryNode', 'ui.bootstrap',
        'ReleaseOrder', 'ReleaseOrderItem', 'eums.ip', 'ngToast', 'Contact'])
    .controller('WarehouseDeliveryManagementController', function ($scope, $location, $q, $routeParams, DeliveryService,
                                                                   DeliveryNodeService, ReleaseOrderService, ReleaseOrderItemService,
                                                                   IPService, ngToast, ContactService, UserService) {
        $scope.currentUser = {};
        $scope.datepicker = {};
        $scope.districts = [];
        $scope.districtsLoaded = false;
        $scope.contact = {};
        $scope.selectedLocation = {};
        $scope.deliveryNodes = [];
        $scope.delivery = {};
        $scope.releaseOrderItems = [];
        $scope.track = $scope.track ? true : false;
        $scope.valid_time_limitation = true;

        $scope.addContact = function (node, nodeIndex) {
            $scope.$broadcast('add-contact', node, nodeIndex);
        };

        $scope.$on('contact-saved', function (event, contact) {
            $scope.contact = {id: contact._id};
            var contactInput = $('#contact-select');
            var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
            contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);
            contactInput.val(contact._id);

            contact.id = contact._id;
            event.stopPropagation();

        });

        $scope.isDeliveryTracked = function () {
            return ($scope.delivery.track) &&
                ($scope.contact && $scope.contact.id) &&
                ($scope.selectedLocation && $scope.selectedLocation.id);
        };

        $scope.saveDelivery = function () {
            if (isInvalid($scope.contact.id) || isInvalid($scope.selectedLocation.id) || !isTimeLimitationValid()) {
                createToast('Please fill in required field!', 'danger');
            } else {
                showLoadingModal(true);
                return createOrUpdateDeliveries()
                    .then(function () {
                        getDelivery();
                        showLoadingModal(false);
                        createToast('Warehouse Delivery Saved!', 'success')
                    })
                    .catch(handleErrors)
                    .finally(function () {
                        showLoadingModal(false);
                    });
            }
        };

        init();

        function init() {
            var promises = [];
            promises.push(loadUserPermissions());
            promises.push(loadCurrentUser());
            $q.all(promises).then(function () {

                IPService.loadAllDistricts().then(function (response) {
                    $scope.districts = response.data.map(function (district) {
                        return {id: district, name: district};
                    });
                    $scope.districtsLoaded = true;
                });

                showLoadingModal(true);
                getDelivery();
                showLoadingModal(false);
            });
        }

        function loadUserPermissions() {
            return UserService.retrieveUserPermissions().then(function (permissions) {
                $scope.userPermissions = permissions;
                UserService.hasPermission("eums.add_distributionplan", $scope.userPermissions).then(function (result) {
                    $scope.can_add_distributionplan = result;
                });
                UserService.hasPermission("eums.change_distributionplan", $scope.userPermissions).then(function (result) {
                    $scope.can_change_distributionplan = result;
                });
            });
        }

        function loadCurrentUser() {
            return UserService.getCurrentUser().then(function (user) {
                $scope.currentUser = user;
            });
        }

        function createToast(message, klass) {
            ngToast.create({
                content: message,
                class: klass,
                maxNumber: 1,
                dismissOnTimeout: true
            });
        }

        function showLoadingModal(show) {
            if (show && !angular.element('#loading').hasClass('in')) {
                angular.element('#loading').modal();
            }
            else if (!show) {
                angular.element('#loading').modal('hide');
                angular.element('#loading.modal').removeClass('in');
            }
        }

        function isTimeLimitationValid() {
            $scope.valid_time_limitation = $scope.delivery.time_limitation_on_distribution === 0 ? false : true;
            return $scope.valid_time_limitation;
        }

        var setLocationAndContactFields = function () {
            ContactService.get($scope.contact.id)
                .then(function (contact) {
                    $('#contact-select').siblings('div').find('a span.select2-chosen').text(contact.firstName + ' ' + contact.lastName);
                });

            $('#location-select').siblings('div').find('a span.select2-chosen').text($scope.selectedLocation.id);
        };

        function releaseOrderItemsTotalValue() {
            return $scope.releaseOrderItems.sum(function (orderItem) {
                return parseFloat(orderItem.value);
            });
        }

        var getDelivery = function () {
            var deliveryParams = ['consignee', 'sales_order.programme', 'delivery', 'items.item.unit'];
            var deliveryNodeParams = ['consignee'];

            ReleaseOrderService.get($routeParams.releaseOrderId, deliveryParams)
                .then(function (releaseOrder) {
                    $scope.selectedReleaseOrder = releaseOrder;
                    $scope.selectedReleaseOrder.totalValue = 0.0;
                    $scope.releaseOrderItems = releaseOrder.items;
                    $scope.selectedReleaseOrder.totalValue = releaseOrderItemsTotalValue();
                    $scope.delivery = releaseOrder.delivery ? releaseOrder.delivery : {};

                    if ($scope.delivery) {
                        $scope.track = $scope.delivery.track;
                        $scope.selectedLocation.id = $scope.delivery.location;
                        $scope.contact.id = $scope.delivery.contactPersonId;
                        DeliveryNodeService.filter({distribution_plan: $scope.delivery.id}, deliveryNodeParams)
                            .then(function (childNodes) {
                                var firstChildNode = childNodes.first();

                                if (childNodes && firstChildNode) {
                                    $scope.deliveryNodes.add(childNodes);
                                    $scope.delivery.time_limitation_on_distribution = firstChildNode.timeLimitationOnDistribution;
                                    $scope.delivery.tracked_date = firstChildNode.tracked_date;
                                    setLocationAndContactFields();
                                }
                            });
                    }
                });
        };

        var saveDeliveryNodes = function () {
            var deliveryNodePromises = [];
            $scope.releaseOrderItems.forEach(function (releaseOrderItem) {
                deliveryNodePromises.push(saveDeliveryNode(releaseOrderItem));
            });

            return $q.all(deliveryNodePromises);
        };

        var updateDeliveryNodes = function () {
            var deliveryNodePromises = [];
            $scope.releaseOrderItems.forEach(function (releaseOrderItem) {
                deliveryNodePromises.push(updateDeliveryNode(releaseOrderItem));
            });

            return $q.all(deliveryNodePromises);
        };

        function setTrackedDate(oldTrack, newTrack) {
            if (!oldTrack && newTrack) {
                $scope.delivery.tracked_date = new Date();
            }
            if (!newTrack) {
                $scope.delivery.tracked_date = null;
            }
        }

        function createOrUpdateDeliveries() {
            if ($scope.delivery && $scope.delivery.id) {

                setTrackedDate($scope.delivery.track, $scope.track);

                $scope.delivery.time_limitation_on_distribution = $scope.delivery.time_limitation_on_distribution || null;
                $scope.delivery.track = $scope.track;
                $scope.delivery.contact_person_id = $scope.contact.id;
                $scope.delivery.location = $scope.selectedLocation.id;
                return DeliveryService.update($scope.delivery)
                    .then(function (createdDelivery) {
                        $scope.delivery = createdDelivery;
                        return updateDeliveryNodes();
                    });
            }
            else {
                var deliveryDetails = {
                    programme: $scope.selectedReleaseOrder.salesOrder.programme.id,
                    consignee: $scope.selectedReleaseOrder.consignee.id,
                    location: $scope.selectedLocation.id,
                    contact_person_id: $scope.contact.id,
                    delivery_date: $scope.selectedReleaseOrder.deliveryDate,
                    track: $scope.track,
                    time_limitation_on_distribution: $scope.delivery.time_limitation_on_distribution || null,
                    tracked_date: ($scope.track) ? new Date() : null
                };
                return DeliveryService.create(deliveryDetails)
                    .then(function (createdDelivery) {
                        $scope.delivery = createdDelivery;
                        return saveDeliveryNodes();
                    });
            }
        }

        var isInvalid = function (field) {
            $scope.errors = field ? false : true;
            return field ? false : true;
        };

        var getNodeForItem = function (releaseOrderItem) {
            return $scope.deliveryNodes.find(function (deliveryNode) {
                return deliveryNode.item === releaseOrderItem.id;
            });
        };

        var updateDeliveryNode = function (releaseOrderItem) {
            var node = getNodeForItem(releaseOrderItem);
            node.location = $scope.selectedLocation.id;
            node.contact_person_id = $scope.contact.id;
            node.delivery_date = $scope.selectedReleaseOrder.deliveryDate;
            node.track = $scope.track;
            node.time_limitation_on_distribution = $scope.delivery.time_limitation_on_distribution || null;
            node.tracked_date = $scope.delivery.tracked_date;
            return DeliveryNodeService.update(node)

        };

        var saveDeliveryNode = function (releaseOrderItem) {
            var node = {
                location: $scope.selectedLocation.id,
                contact_person_id: $scope.contact.id,
                delivery_date: $scope.selectedReleaseOrder.deliveryDate,
                track: $scope.track,
                consignee: $scope.selectedReleaseOrder.consignee.id,
                distribution_plan: $scope.delivery.id,
                tree_position: 'IMPLEMENTING_PARTNER',
                item: releaseOrderItem,
                quantity: parseInt(releaseOrderItem.quantity),
                time_limitation_on_distribution: $scope.delivery.time_limitation_on_distribution || null,
                tracked_date: $scope.delivery.tracked_date
            };

            return DeliveryNodeService.create(node)
        };

        var handleErrors = function () {
            $scope.nodeSavingErrors = true;
            createToast('Could not save the delivery', 'danger');
        };
    });
