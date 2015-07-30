'use strict';

angular.module('WarehouseDeliveryManagement', ['DistributionPlan', 'ngTable', 'siTable', 'DistributionPlanNode', 'ui.bootstrap',
    'ReleaseOrder', 'ReleaseOrderItem', 'eums.ip', 'ngToast', 'Contact'])
    .controller('WarehouseDeliveryManagementController', function ($scope, $location, $q, $routeParams, DistributionPlanService,
                                                                   DistributionPlanNodeService, ReleaseOrderService, ReleaseOrderItemService,
                                                                   IPService, ngToast, ContactService) {
        $scope.datepicker = {};
        $scope.districts = [];
        $scope.contact = {};
        $scope.selectedLocation = {};
        $scope.deliveryNodes = [];
        $scope.delivery = {};
        $scope.releaseOrderItems = [];
        $scope.districtsLoaded = false;
        $scope.track = $scope.track ? true : false;

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

        $scope.addConsignee = function (node, nodeIndex) {
            $scope.$broadcast('add-consignee', node, nodeIndex);
        };

        $scope.$on('consignee-saved', function (event, consignee, node, nodeIndex) {
            node.consignee = consignee;
            $scope.$broadcast('set-consignee-for-node', consignee, nodeIndex);
            event.stopPropagation();
        });

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
                    $scope.delivery = releaseOrder.delivery? releaseOrder.delivery.data : {};

                    if ($scope.delivery) {
                        $scope.track = $scope.delivery.track;
                        DistributionPlanNodeService.filter({distribution_plan: $scope.delivery.id}, deliveryNodeParams)
                            .then(function (childNodes) {
                                var firstChildNode = childNodes.first();
                                if (childNodes && firstChildNode) {
                                    $scope.deliveryNodes.add(childNodes);
                                    $scope.selectedLocation.id = firstChildNode.location;
                                    $scope.contact.id = firstChildNode.contactPersonId;
                                    setLocationAndContactFields();
                                }
                            });
                    }

                });
        };

        showLoadingModal(true);

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
            $scope.districtsLoaded = true;
        });

        getDelivery();
        showLoadingModal(false);

        var saveDeliveryNodes = function () {
            $scope.releaseOrderItems.forEach(function (releaseOrderItem) {
                saveDeliveryNode(releaseOrderItem);
            });
        };

        $scope.saveDelivery = function () {
            if (isInvalid($scope.contact.id) || isInvalid($scope.selectedLocation.id)) {
                createToast('Please fill in required field!', 'danger');
                return;
            }
            showLoadingModal(true);
            if ($scope.delivery.id) {
                saveDeliveryNodes();
                var message = 'Warehouse Delivery updated!';
                createToast(message, 'success');
            }
            else {
                DistributionPlanService.createPlan({
                    programme: $scope.selectedReleaseOrder.salesOrder.programme.id,
                    consignee: $scope.selectedReleaseOrder.consignee.id,
                    location: $scope.selectedLocation.id,
                    contact_person_id: $scope.contact.id,
                    delivery_date: $scope.selectedReleaseOrder.deliveryDate,
                    track: $scope.track
                }).then(function (createdDelivery) {
                    $scope.delivery = createdDelivery;
                    saveDeliveryNodes();
                    var message = 'Warehouse Delivery Saved!';
                    createToast(message, 'success');
                });
            }
        };

        var isInvalid = function (field) {
            $scope.errors = field ? false : true;
            return field ? false : true;
        };

        var getNodeForItem = function (releaseOrderItem) {
            return $scope.deliveryNodes.find(function (deliveryNode) {
                return deliveryNode.item === releaseOrderItem.id;
            });
        };

        var saveDeliveryNode = function (releaseOrderItem) {
            var node = getNodeForItem(releaseOrderItem);
            if (node) {
                node.location = $scope.selectedLocation.id;
                node.contact_person_id = $scope.contact.id;
                node.delivery_date = $scope.selectedReleaseOrder.deliveryDate;
                node.track = $scope.track;
                DistributionPlanNodeService.update(node)
                    .then(function () {
                        getDelivery();
                        showLoadingModal(false);
                    },
                    function (response) {
                        handleErrors(response);
                    });
            } else {
                node = {
                    consignee: $scope.selectedReleaseOrder.consignee.id,
                    location: $scope.selectedLocation.id,
                    contact_person_id: $scope.contact.id,
                    distribution_plan: $scope.delivery.id,
                    tree_position: 'IMPLEMENTING_PARTNER',
                    item: releaseOrderItem,
                    targeted_quantity: parseInt(releaseOrderItem.quantity),
                    delivery_date: $scope.selectedReleaseOrder.deliveryDate,
                    track: $scope.track
                };
                DistributionPlanNodeService.create(node)
                    .then(function () {
                        getDelivery();
                        showLoadingModal(false);
                    }, function (response) {
                        handleErrors(response, releaseOrderItem.item.materialCode);
                    });


            }
        };

        var handleErrors = function (response, materialCode) {
            var message = '';
            var errors = response.data;
            for (var property in errors) {
                message += 'Material: ' + materialCode + ', ' + property + ': ' + errors[property] + '\n';
            }
            $scope.nodeSavingErrors = true;
            createToast(message, 'danger');
        };
    });
