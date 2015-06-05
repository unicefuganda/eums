'use strict';

angular.module('NewDistributionPlan', ['DistributionPlan', 'ngTable', 'siTable', 'SalesOrderItem', 'DistributionPlanNode', 'ui.bootstrap', 'Consignee', 'SalesOrder', 'PurchaseOrder', 'PurchaseOrderItem', 'eums.ip', 'ngToast', 'Contact', 'User', 'Item'])
    .controller('NewDistributionPlanController', function ($scope, $location, $q, $routeParams, DistributionPlanService, DistributionPlanNodeService, ConsigneeService, SalesOrderService, PurchaseOrderService, PurchaseOrderItemService, SalesOrderItemService, IPService, UserService, ItemService, ngToast, ContactService) {
        $scope.datepicker = {};
        $scope.districts = [];
        $scope.consignee_button_text = 'Add Consignee';
        $scope.contact = {};
        $scope.lineItem = {};
        $scope.itemIndex = '';
        $scope.track = false;
        $scope.consigneeLevel = false;
        $scope.isReport = false;

        $scope.distributionPlanReport = $location.path().substr(1, 15) !== 'delivery-report';
        $scope.quantityHeaderText = $scope.distributionPlanReport ? 'Targeted Qty' : 'Delivered Qty';
        $scope.deliverNewDistributionPlanyDateHeaderText = $scope.distributionPlanReport ? 'Delivery Date' : 'Date Delivered';

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

        $scope.addContact = function (itemIndex, lineItem) {
            $scope.$parent.itemIndex = itemIndex;
            $scope.$parent.lineItem = lineItem;
            $('#add-contact-modal').modal();
        };

        $scope.addRemark = function (itemIndex, lineItem) {
            $scope.$parent.itemIndex = itemIndex;
            $scope.$parent.lineItem = lineItem;
            $('#add-remark-modal').modal();
        };

        $scope.saveContact = function () {
            ContactService
                .create($scope.contact)
                .then(function (contact) {
                    $('#add-contact-modal').modal('hide');

                    var contactInput = $('#contact-select-' + $scope.itemIndex);
                    var contactSelect2Input = contactInput.siblings('div').find('a span.select2-chosen');
                    contactSelect2Input.text(contact.firstName + ' ' + contact.lastName);

                    contactInput.val(contact._id);
                    $scope.lineItem.contactPerson = contact._id;

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
        });

        ConsigneeService.all().then(function (consignees) {
            $scope.consignees = consignees;
        });

        $scope.distributionPlanNodes = [];
        $scope.salesOrderItems = [];

        if ($scope.distributionPlanReport) {
            SalesOrderService.get($routeParams.salesOrderId, ['programme', 'salesorderitem_set']).then(function (response) {

                $scope.selectedSalesOrder = response;
                var salesOrderItemSetPromises = [];
                $scope.selectedSalesOrder.salesorderitemSet.forEach(function (salesOrderItem) {
                    ItemService.get(salesOrderItem.item.id, ['unit']).then(function (item) {
                        var formattedSalesOrderItem = {
                            display: item.description,
                            materialCode: item.materialCode,
                            quantity: salesOrderItem.quantity,
                            unit: item.unit.name,
                            information: salesOrderItem
                        };
                        formattedSalesOrderItem.quantityLeft = computeQuantityLeft(formattedSalesOrderItem);

                        if (formattedSalesOrderItem.information.id === Number($routeParams.salesOrderItemId) && !$routeParams.distributionPlanNodeId) {
                            $scope.selectedSalesOrderItem = formattedSalesOrderItem;
                            $scope.selectSalesOrderItem();
                        }

                        $scope.salesOrderItems.push(formattedSalesOrderItem);
                    });

                    $q.all(salesOrderItemSetPromises).then(function () {
                        if (!$routeParams.salesOrderItemId) {
                            showLoadingModal(false);
                        }
                    });
                });
            });
        }
        else {
            $scope.isReport = true;
            UserService.getCurrentUser().then(function (user) {
                $scope.user = user;
                if ($scope.user.consignee_id) {
                    PurchaseOrderService.getConsigneePurchaseOrder($routeParams.purchaseOrderId, $scope.user.consignee_id).then(function (response) {

                        $scope.selectedPurchaseOrder = response;
                        $scope.selectedSalesOrder = $scope.selectedPurchaseOrder.sales_order;

                        var purchaseOrderItemSetPromises = [];
                        $scope.selectedPurchaseOrder.purchaseorderitem_set.forEach(function (purchaseOrderItem) {
                            purchaseOrderItemSetPromises.push(
                                PurchaseOrderItemService.get(purchaseOrderItem).then(function (result) {
                                    var formattedSalesOrderItem = {
                                        display: result.sales_order_item.item.description,
                                        materialCode: result.sales_order_item.item.material_code,
                                        quantity: $scope.selectedSalesOrderItem ? $scope.selectedSalesOrderItem.quantity : result.sales_order_item.quantity,
                                        unit: result.sales_order_item.item.unit.name,
                                        information: result.sales_order_item
                                    };
                                    formattedSalesOrderItem.quantityLeft = $scope.selectedSalesOrderItem ? computeQuantityLeft($scope.selectedSalesOrderItem) : computeQuantityLeft(formattedSalesOrderItem);

                                    if (formattedSalesOrderItem.information.id === Number($routeParams.salesOrderItemId)) {
                                        $scope.selectedSalesOrderItem = formattedSalesOrderItem;
                                        if (!$routeParams.distributionPlanNodeId) {
                                            $scope.selectSalesOrderItem();
                                        }
                                    }

                                    $scope.salesOrderItems.push(formattedSalesOrderItem);
                                }));
                        });

                        $q.all(purchaseOrderItemSetPromises).then(function () {
                            if (!$routeParams.salesOrderItemId) {
                                showLoadingModal(false);
                            }
                        });
                    });
                }
                else {
                    PurchaseOrderService.get($routeParams.purchaseOrderId, ['sales_order', 'purchaseorderitem_set']).then(function (response) {

                        $scope.selectedPurchaseOrder = response;
                        $scope.selectedSalesOrder = $scope.selectedPurchaseOrder.salesOrder;

                        var salesOrderItemSetPromises = [];
                        $scope.selectedPurchaseOrder.purchaseorderitemSet.forEach(function (purchaseOrderItem) {
                            salesOrderItemSetPromises.push(SalesOrderItemService.get(purchaseOrderItem.salesOrderItem, ['item']).then(function (salesOrderItem) {
                                var formattedSalesOrderItem = {
                                    display: salesOrderItem.item.description,
                                    materialCode: salesOrderItem.item.materialCode,
                                    quantity: purchaseOrderItem.quantity ? purchaseOrderItem.quantity : salesOrderItem.quantity,
                                    unit: salesOrderItem.item.unit, // add name to unit
                                    information: salesOrderItem
                                };
                                formattedSalesOrderItem.quantityLeft = computeQuantityLeft(formattedSalesOrderItem);

                                if (formattedSalesOrderItem.information.id === Number($routeParams.salesOrderItemId) && !$routeParams.distributionPlanNodeId) {
                                    $scope.selectedSalesOrderItem = formattedSalesOrderItem;
                                    $scope.selectSalesOrderItem();
                                }
                                $scope.salesOrderItems.push(formattedSalesOrderItem);
                            }));
                        });

                        $q.all(salesOrderItemSetPromises).then(function () {
                            if (!$routeParams.salesOrderItemId) {
                                showLoadingModal(false);
                            }
                        });
                    });
                }
            });
        }

        if ($routeParams.distributionPlanNodeId) {
            $scope.consignee_button_text = 'Add Sub-Consignee';

            DistributionPlanNodeService.getPlanNodeDetails($routeParams.distributionPlanNodeId).then(function (planNode) {
                $scope.planNode = planNode;

                UserService.getCurrentUser().then(function (user) {
                    $scope.user = user;
                    if ($scope.user.consignee_id) {
                        $scope.consigneeLevel = $scope.planNode.parent ? false : true;
                    }

                    $scope.distributionPlan = planNode.distributionPlan;
                    $scope.track = planNode.track;

                    SalesOrderItemService.get($routeParams.salesOrderItemId).then(function (result) {
                        ItemService.get(result.item, ['unit']).then(function (item) {
                            $scope.selectedSalesOrderItem = {
                                display: item.description,
                                materialCode: item.materialCode,
                                quantity: result.quantity,
                                unit: item.unit.name,
                                information: result
                            };
                            $scope.selectedSalesOrderItem.quantityLeft = computeQuantityLeft($scope.selectedSalesOrderItem);
                            var childNodePromises = [];
                            $scope.planNode.children.forEach(function (child) {
                                childNodePromises.push(DistributionPlanNodeService.getPlanNodeDetails(child.id));
                            });
                            $q.all(childNodePromises).then(function (children) {
                                setDistributionPlanNode($scope.selectedSalesOrderItem, children);
                            });
                        });
                    });
                });
            });
        }

        $scope.selectSalesOrderItem = function () {
            $scope.track = false;
            $scope.invalidNodes = NaN;
            $scope.distributionPlan = NaN;

            showLoadingModal(true);

            UserService.getCurrentUser().then(function (user) {
                $scope.user = user;
                if ($scope.user.consignee_id) {
                    PurchaseOrderService.getConsigneePurchaseOrderNode($scope.user.consignee_id, $scope.selectedSalesOrderItem.information.id).then(function (response) {
                        var node = response;
                        var locPath = $location.path().split('/')[1];
                        var documentId = $scope.distributionPlanReport ? $scope.selectedSalesOrder.id : $scope.selectedPurchaseOrder.id;
                        $location.path(
                                '/' + locPath + '/new/' +
                                documentId + '-' +
                                $scope.selectedSalesOrderItem.information.id + '-' +
                                node
                        );
                    });
                }
                else {
                    $scope.distributionPlanNodes = [];

                    var selectedSalesOrderItem = $scope.selectedSalesOrderItem;
                    SalesOrderItemService
                        .get(selectedSalesOrderItem.information.id, ['distributionplannode_set'])
                        .then(function (salesOrderItem) {
                            SalesOrderItemService
                                .getTopLevelDistributionPlanNodes(salesOrderItem)
                                .then(function (topLevelNodes) {
                                    setDistributionPlanNode(selectedSalesOrderItem, topLevelNodes);
                                });
                        });
                }
            });
        };

        function savePlanTracking() {
            if ($scope.track && $scope.distributionPlan && (!$scope.planNode || $scope.consigneeLevel)) {
                DistributionPlanService.updatePlanTracking($scope.distributionPlan, $scope.track);
            }
        }

        $scope.trackSalesOrderItem = function () {
            $scope.invalidNodes = anyInvalidFields($scope.distributionPlanNodes);
            savePlanTracking();
        };

        var formatDateForSave = function (date) {
            return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        };

        //var formatDateForDisplay = function (date) {
        //    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        //};

        var setDistributionPlanNode = function (selectedSalesOrderItem, nodes) {
            if (nodes.length) {
                var quantityLeft = parseInt(selectedSalesOrderItem.quantity);
                quantityLeft = quantityLeft - _.reduce(_.pluck(nodes, 'targetedQuantity'), function (total, val) {
                    return total + val;
                });
                $scope.selectedSalesOrderItem.quantityLeft = quantityLeft.toString();
                $scope.distributionPlanNodes = nodes;
            }
            else {
                $scope.distributionPlanNodes = [];
            }
            setDatePickers();
            showLoadingModal(false);
        };

        $scope.addDistributionPlanNode = function () {
            var distributionPlanNode = {
                item: $scope.selectedSalesOrderItem.information.id,
                plannedDistributionDate: '',
                targetedQuantity: 0,
                destinationLocation: '',
                contactPerson: '',
                modeOfDelivery: '',
                remark: '',
                track: false,
                forEndUser: false,
                flowTriggered: false
            };

            $scope.distributionPlanNodes.push(distributionPlanNode);
            setDatePickers();
        };

        function computeQuantityLeft(salesOrderItem) {
            var reduced = $scope.distributionPlanNodes.reduce(function (previous, current) {
                return {targetedQuantity: isNaN(current.targetedQuantity) ? previous.targetedQuantity : (previous.targetedQuantity + current.targetedQuantity)};
            }, {targetedQuantity: 0});

            return salesOrderItem.quantity - reduced.targetedQuantity;
        }

        function invalidFields(item) {
            return item.targetedQuantity <= 0 || isNaN(item.targetedQuantity) || !item.consignee || !item.destinationLocation || !item.contactPerson || !item.plannedDistributionDate;
        }

        function anyInvalidFields(lineItems) {
            var itemsWithInvalidFields = lineItems.filter(function (item) {
                return $scope.selectedSalesOrderItem.quantityLeft < 0 || invalidFields(item);
            });
            return itemsWithInvalidFields.length > 0;
        }

        $scope.$watch('distributionPlanNodes', function (newPlanNodes) {
            if (isNaN($scope.invalidNodes) && $scope.distributionPlanNodes.length) {
                $scope.invalidNodes = true;
                return;
            }

            if (newPlanNodes.length) {
                $scope.selectedSalesOrderItem.quantityLeft = computeQuantityLeft($scope.selectedSalesOrderItem);
                $scope.invalidNodes = anyInvalidFields(newPlanNodes);
            }
        }, true);

        function setDatePickers() {
            $scope.datepicker = {};
            $scope.distributionPlanNodes.forEach(function (item, index) {
                $scope.datepicker[index] = false;
            });
        }

        function parentNodeId() {
            if (!!$scope.planNode) {
                return $scope.planNode.id;
            }
            return null;
        }

        function saveNode(uiPlanNode) {
            var nodeId = uiPlanNode.id;
            var plannedDate = new Date(uiPlanNode.plannedDistributionDate);

            if (plannedDate.toString() === 'Invalid Date') {
                var planDate = uiPlanNode.plannedDistributionDate.split('/');
                plannedDate = new Date(planDate[2], planDate[1] - 1, planDate[0]);
            }

            UserService.getCurrentUser().then(function (user) {
                var node = {
                    consignee: uiPlanNode.consignee.id,
                    location: uiPlanNode.location,
                    contact_person_id: uiPlanNode.contactPerson.id,
                    distribution_plan: $scope.distributionPlan,
                    tree_position: uiPlanNode.forEndUser ? 'END_USER' : (parentNodeId() === null ? 'IMPLEMENTING_PARTNER' : 'MIDDLE_MAN'),
                    mode_of_delivery: uiPlanNode.modeOfDelivery ? uiPlanNode.modeOfDelivery : 'WAREHOUSE',
                    parent: parentNodeId(),
                    item: uiPlanNode.item,
                    targeted_quantity: uiPlanNode.targetedQuantity,
                    planned_distribution_date: formatDateForSave(plannedDate),
                    remark: uiPlanNode.remark,
                    track: user.consignee_id ? true : $scope.track
                };

                if (nodeId) {
                    node.id = nodeId;
                    node.children = uiPlanNode.children ? uiPlanNode.children : [];

                    return DistributionPlanNodeService.update(node);
                }
                else {
                    return DistributionPlanNodeService.create(node);
                }
            });
        }

        function saveDistributionPlanNodes() {
            var message = $scope.distributionPlanReport ? 'Plan Saved!' : 'Report Saved!';
            $scope.distributionPlanNodes.forEach(function (node) {
                saveNode(node);
            });
            createToast(message, 'success');
        }

        $scope.saveDistributionPlanNodes = function () {
            if ($scope.distributionPlan) {
                saveDistributionPlanNodes();
            }
            else {
                DistributionPlanService.createPlan({programme: $scope.selectedSalesOrder.programme.id})
                    .then(function (createdPlan) {
                        $scope.distributionPlan = createdPlan.id;
                        saveDistributionPlanNodes();
                    });
            }
        };

        $scope.addSubConsignee = function (node) {
            var locPath = $location.path().split('/')[1];
            var documentId = $scope.distributionPlanReport ? $scope.selectedSalesOrder.id : $scope.selectedPurchaseOrder.id;
            $location.path(
                    '/' + locPath + '/new/' +
                    documentId + '-' +
                    $scope.selectedSalesOrderItem.information.id + '-' +
                    node.id
            );
        };

        $scope.showSubConsigneeButton = function (node) {
            return node.id && !node.forEndUser;
        };

        $scope.previousConsignee = function (planNode) {
            var locPath = $location.path().split('/')[1];
            var documentId = $scope.distributionPlanReport ? $scope.selectedSalesOrder.id : $scope.selectedPurchaseOrder.id;
            if (planNode.parent) {
                $location.path(
                        '/' + locPath + '/new/' +
                        documentId + '-' +
                        $scope.selectedSalesOrderItem.information.id + '-' +
                        planNode.parent
                );
            }
            else {
                $location.path(
                        '/' + locPath + '/new/' +
                        documentId + '-' +
                        $scope.selectedSalesOrderItem.information.id
                );
            }
        };
    }
).
    directive('searchContacts', function (ContactService, $timeout) {
        function formatResponse(data) {
            return data.map(function (contact) {
                return {
                    id: contact._id,
                    text: contact.firstName + ' ' + contact.lastName
                };
            });
        }

        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, element, _, ngModel) {

                element.select2({
                    minimumInputLength: 1,
                    width: '150px',
                    query: function (query) {
                        var data = {results: []};
                        ContactService.filter(query.term).then(function (foundContacts) {
                            data.results = formatResponse(foundContacts);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            if (modelValue) {
                                ContactService.get(modelValue).then(function (contact) {
                                    if (contact._id) {
                                        callback({
                                            id: contact._id,
                                            text: contact.firstName + ' ' + contact.lastName
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

                element.change(function () {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });
            }
        };
    })
    .directive('searchFromList', function ($timeout) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var list = JSON.parse(attrs.list);

                element.select2({
                    width: '100%',
                    query: function (query) {
                        var data = {results: []};
                        var matches = list.filter(function (item) {
                            return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                        });
                        data.results = matches.map(function (match) {
                            return {
                                id: match.id,
                                text: match.name
                            };
                        });
                        query.callback(data);
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var matchingItem = list.filter(function (item) {
                                return item.id === ngModel.$modelValue;
                            })[0];
                            if (matchingItem) {
                                callback({id: matchingItem.id, text: matchingItem.name});
                            }
                        });
                    }
                });

                element.change(function () {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });
            }
        };
    })
    .directive('onlyDigits', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attr, ngModelCtrl) {
                function inputValue(val) {
                    if (val) {
                        var digits = val.toString().replace(/[^0-9]/g, '');

                        if (digits.toString() !== val.toString()) {
                            ngModelCtrl.$setViewValue(digits);
                            ngModelCtrl.$render();
                        }
                        return parseInt(digits, 10);
                    }
                    return undefined;
                }

                ngModelCtrl.$parsers.push(inputValue);
            }
        };
    });