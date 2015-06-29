'use strict';

angular.module('WarehouseDeliveryPlan', ['DistributionPlan', 'ngTable', 'siTable', 'DistributionPlanNode', 'ui.bootstrap',
    'ReleaseOrder', 'ReleaseOrderItem', 'eums.ip', 'ngToast', 'Contact'])
    .controller('WarehouseDeliveryPlanController', function ($scope, $location, $q, $routeParams, DistributionPlanService,
                                                             DistributionPlanNodeService, ReleaseOrderService, ReleaseOrderItemService,
                                                             IPService, ngToast, ContactService) {
        $scope.datepicker = {};
        $scope.districts = [];
        $scope.contact = {};
        $scope.selectedDate = '';
        $scope.selectedLocation = {};
        $scope.deliveryNodes = [];
        $scope.delivery = {};
        $scope.releaseOrderItems = [];
        $scope.districtsLoaded = false;

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

        $scope.addContact = function () {
            $('#add-contact-modal').modal();
        };

        $scope.saveContact = function () {
            ContactService.create($scope.contact)
                .then(function (contact) {
                    $('#add-contact-modal').modal('hide');

                    var contactInput = $('#contact-select');
                    var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
                    contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);

                    contactInput.val(contact._id);

                    $scope.contact = {};
                }, function (response) {
                    createToast(response.data.error, 'danger');
                });
        };

        $scope.invalidContact = function (contact) {
            return !(contact.firstName && contact.lastName && contact.phone);
        };

        showLoadingModal(true);

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
            $scope.districtsLoaded = true;
        });

        ReleaseOrderService.get($routeParams.releaseOrderId,
            ['consignee', 'sales_order.programme', 'delivery', 'items.item.unit']).then(function (releaseOrder) {
                $scope.selectedReleaseOrder = releaseOrder;
                $scope.selectedReleaseOrder.totalValue = 0.0;
                $scope.releaseOrderItems = releaseOrder.items;
                $scope.selectedReleaseOrder.totalValue = $scope.releaseOrderItems.sum(function (orderItem) {
                    return parseFloat(orderItem.value);
                });
                $scope.delivery = releaseOrder.delivery;
                if ($scope.delivery) {
                    DistributionPlanNodeService.getNodesByDelivery($scope.delivery.id)
                        .then(function (response) {
                            $scope.deliveryNodes = response.data;
                            $scope.selectedLocation.id = response.data[0].location;
                            $scope.selectedDate = response.data[0].plannedDistributionDate;
                            $scope.contact.id = response.data[0].contactPersonId;
                        });
                }
                showLoadingModal(false);
            });

        var formatDateForSave = function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        };

        var saveDeliveryNodes = function () {
            $scope.releaseOrderItems.forEach(function (releaseOrderItem) {
                saveDeliveryNode(releaseOrderItem);
            });
        };

        $scope.saveDelivery = function () {
            validate($scope.selectedDate, 'Fill in Date field!');
            validate($scope.contact.id, 'Fill in Contact field!');
            validate($scope.selectedLocation.id, 'Fill in Location field!');
            
            if ($scope.delivery) {
                saveDeliveryNodes();
            }
            else {
                DistributionPlanService.createPlan({programme: $scope.selectedReleaseOrder.salesOrder.programme.id})
                    .then(function (createdDelivery) {
                        var message = 'Warehouse Delivery Saved!';
                        createToast(message, 'success');

                        $scope.delivery = createdDelivery;
                        saveDeliveryNodes();
                    });
            }
        };

        var validate = function (field, message){
            if (!field) {
                createToast(message, 'danger');
                return;
            }
        }

        var getNodeForItem = function (releaseOrderItem) {
            return $scope.deliveryNodes.find(function (deliveryNode) {
                return deliveryNode.item === releaseOrderItem.id
            });
        };

        var saveDeliveryNode = function (releaseOrderItem) {
            var deliveryDate = new Date($scope.selectedDate);

            if (deliveryDate.toString() === 'Invalid Date') {
                var planDate = $scope.selectedDate.split('/');
                deliveryDate = new Date(planDate[2], planDate[1] - 1, planDate[0]);
            }
            var node = getNodeForItem(releaseOrderItem);
            if (node) {
                node.location = $scope.selectedLocation.id;
                node.contact_person_id = $scope.contact.id;
                node.planned_distribution_date = formatDateForSave(deliveryDate);
                DistributionPlanNodeService.update(node)
                    .then(function (response) {
                        handleSuccess(true);
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
                    planned_distribution_date: formatDateForSave(deliveryDate),
                    track: false
                };
                DistributionPlanNodeService.create(node)
                    .then(function (response) {
                        handleSuccess(false);
                        $scope.deliveryNodes.push(response.data);
                    }, function (response) {
                        handleErrors(response, releaseOrderItem.item.materialCode);
                    });

            }

        };

        var handleSuccess = function (isUpdate) {
            var message = 'Warehouse Delivery Node Saved!';

            if (isUpdate) {
                message = 'Warehouse Delivery Node Updated!';
            }
            createToast(message, 'success');
        }
        var handleErrors = function (response, materialCode) {
            var message = '';
            var errors = response.data;
            for (var property in errors) {
                message += 'Material: ' + materialCode + ', ' + property + ': ' + errors[property] + '\n';
            }
            $scope.nodeSavingErrors = true;
            createToast(message, 'danger');
        }
    });