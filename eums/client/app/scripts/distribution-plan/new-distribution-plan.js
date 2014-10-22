'use strict';

angular.module('NewDistributionPlan', ['DistributionPlan', 'eums.config', 'ngTable', 'siTable', 'Programme', 'SalesOrderItem', 'DistributionPlanNode', 'ui.bootstrap', 'Consignee', 'User'])
    .controller('NewDistributionPlanController', function ($scope, DistributionPlanParameters, SalesOrderItemService, DistributionPlanLineItemService, DistributionPlanService, DistributionPlanNodeService, Districts, ConsigneeService, $q, $timeout) {

        $scope.datepicker = {};

        $scope.districts = Districts.getAllDistricts().map(function (district) {
            return {id: district, name: district};
        });
        ConsigneeService.fetchConsignees().then(function (consignees) {
            $scope.consignees = consignees;
        });

        $scope.salesOrderItems = [];
        $scope.distributionPlanItems = [];

        $scope.initialize = function () {
            $scope.salesOrderItemSelected = undefined;
            $scope.hasSalesOrderItems = false;
            $scope.hasDistributionPlanItems = false;

            $scope.selectedSalesOrder = DistributionPlanParameters.retrieveVariable('selectedSalesOrder');
            $scope.programmeSelected = DistributionPlanParameters.retrieveVariable('programmeSelected');

            $scope.selectedSalesOrder.salesorderitem_set.forEach(function (salesOrderItem) {
                SalesOrderItemService.getSalesOrderItem(salesOrderItem).then(function (result) {
                    var formattedSalesOrderItem = {
                        display: result.item.description,
                        materialCode: result.item.material_code,
                        quantity: result.quantity,
                        quantityLeft: result.quantity,
                        unit: result.item.unit.name,
                        information: result};

                    $scope.salesOrderItems.push(formattedSalesOrderItem);
                });
            });
        };

        $scope.hasTargetedQuantity = function (distributionPlanLineItem) {
            var showInputBox = ['', undefined, '0', 0];
            return (showInputBox.indexOf(distributionPlanLineItem.targetQuantity) === -1);
        };

        $scope.addDistributionPlanItem = function () {
            var distributionPlanLineItem = {
                item: $scope.salesOrderItemSelected.information.item,
                quantity: $scope.salesOrderItemSelected.quantityLeft,
                plannedDistributionDate: '2014-10-10',
                targetQuantity: 0,
                destinationLocation: '',
                modeOfDelivery: '',
                contactPerson: '',
                tracked: false
            };

            var currentDistributionPlanItems = $scope.distributionPlanItems;
            currentDistributionPlanItems.push(distributionPlanLineItem);

            if (currentDistributionPlanItems && currentDistributionPlanItems.length > 0) {
                $scope.hasDistributionPlanItems = true;
            }

            $scope.distributionPlanItems = currentDistributionPlanItems;
            setDatePickers();
        };

        function setDatePickers() {
            $scope.datepicker = {};
            $scope.distributionPlanItems.forEach(function (item, index) {
                $scope.datepicker[index] = false;
            });
        }

        function getLineItemForUpdateFromUILineItem(uiLineItem) {
            return {
                item: uiLineItem.item.id, targetQuantity: uiLineItem.targetQuantity,
                distribution_plan_node: uiLineItem.distribution_plan_node,
                plannedDistributionDate: uiLineItem.plannedDistributionDate,
                remark: uiLineItem.remark
            };
        }

        function createNewNodeAndLineItem(nodeDetails, lineItem) {
            DistributionPlanNodeService.createNode(nodeDetails).then(function (createdNode) {
                var lineItemDetails = {
                    item: lineItem.item.id, targetQuantity: lineItem.targetQuantity,
                    distribution_plan_node: createdNode.id,
                    plannedDistributionDate: lineItem.plannedDistributionDate,
                    remark: lineItem.remark
                };
                DistributionPlanLineItemService.createLineItem(lineItemDetails).then(function () {
                    $scope.planSaved = true;
                    $timeout(function () {
                        $scope.planSaved = false;
                    }, 2000);
                });
            });
        }

        function updateNodeAndLineItem(nodeDetails, lineItem) {
            var nodeSavePromise = DistributionPlanNodeService.updateNode(nodeDetails);
            var lineItemSavePromise = DistributionPlanLineItemService.updateLineItem(lineItem);
            $q.all([nodeSavePromise, lineItemSavePromise]).then(function () {
                $scope.planSaved = true;
                $timeout(function () {
                    $scope.planSaved = false;
                }, 2000);
            });
        }

        function saveNodeAndLineItem(nodeDetails, uiLineItem, uiItem) {
            var d = new Date(uiLineItem.plannedDistributionDate);
            uiLineItem.plannedDistributionDate = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            if (uiLineItem.alreadySaved) {
                var lineItemDetails = getLineItemForUpdateFromUILineItem(uiLineItem, nodeDetails);
                lineItemDetails.id = uiItem.lineItemIdInBackend;
                lineItemDetails.item = uiItem.item;
                nodeDetails.id = uiItem.nodeId;
                updateNodeAndLineItem(nodeDetails, lineItemDetails);
            }
            else {
                createNewNodeAndLineItem(nodeDetails, uiLineItem);
            }
        }

        function saveScopeVariables(distributionPlanItems) {
            $scope.salesOrderItemSelected.quantityLeft = $scope.salesOrderItemSelected.quantity;
            $scope.distributionPlanItems = distributionPlanItems;
        }

        function saveDistributionPlanItems(distributionPlanItems) {
            saveScopeVariables(distributionPlanItems);
            $scope.distributionPlanItems.forEach(function (item) {
                var nodeDetails = {
                    consignee: item.consignee, location: item.destinationLocation, contact_person_id: item.contactPerson,
                    distribution_plan: $scope.planId, tree_position: 'MIDDLE_MAN', modeOfDelivery: item.modeOfDelivery
                };

                $scope.salesOrderItemSelected.quantityLeft = (parseInt($scope.salesOrderItemSelected.quantityLeft) - parseInt(item.targetQuantity)).toString();
                saveNodeAndLineItem(nodeDetails, item, item);
            });
        }

        $scope.saveDistributionPlanItems = function (distributionPlanItems) {
            if ($scope.planId) {
                saveDistributionPlanItems(distributionPlanItems);
            }
            else {
                DistributionPlanService.createPlan({programme: $scope.selectedSalesOrder.programme.id}).then(function (result) {
                    $scope.planId = result.id;
                    saveDistributionPlanItems(distributionPlanItems);
                });
            }
        };

        $scope.hasItemsLeft = function () {
            var emptySalesOrders = ['', undefined];
            if (emptySalesOrders.indexOf($scope.salesOrderItemSelected) === -1) {
                return parseInt($scope.salesOrderItemSelected.quantityLeft) !== 0;
            }

            return true;
        };

        $scope.$watch('salesOrderItemSelected', function () {
            var emptySalesOrders = ['', undefined];
            $scope.distributionPlanItems = [];

            if (emptySalesOrders.indexOf($scope.salesOrderItemSelected) !== -1) {
                $scope.hasSalesOrderItems = false;
            }
            else {
                $scope.hasSalesOrderItems = true;
                $scope.salesOrderItemSelected.quantityLeft = $scope.salesOrderItemSelected.quantity;

                var distributionPlanLineItems = $scope.salesOrderItemSelected.information.distributionplanlineitem_set;

                if (distributionPlanLineItems && distributionPlanLineItems.length) {
                    $scope.hasDistributionPlanItems = true;
                    var itemCounter = 0;
                    var quantityLeft = parseInt($scope.salesOrderItemSelected.quantity);

                    distributionPlanLineItems.forEach(function (lineItemId) {
                        DistributionPlanLineItemService.getLineItem(lineItemId).then(function (lineItem) {
                            lineItem.quantity = quantityLeft.toString();
                            lineItem.targetQuantity = lineItem.targeted_quantity;
                            lineItem.lineItemIdInBackend = lineItem.id;

                            var d = new Date(lineItem.planned_distribution_date);
                            lineItem.plannedDistributionDate = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();

                            DistributionPlanNodeService.getPlanNodeDetails(lineItem.distribution_plan_node).then(function (node) {
                                $scope.planId = node.distribution_plan;
                                lineItem.consignee = node.consignee.id;
                                lineItem.nodeId = node.id;
                                lineItem.contactPerson = node.contact_person._id;
                                lineItem.modeOfDelivery = node.mode_of_Delivery;
                                lineItem.destinationLocation = node.location;
                                lineItem.alreadySaved = true;
                                lineItem.subConsignees = [
                                    {}
                                ];

                                $scope.distributionPlanItems.push(lineItem);
                            });

                            quantityLeft = quantityLeft - parseInt(lineItem.targetQuantity);
                            itemCounter++;
                            $scope.salesOrderItemSelected.quantityLeft = quantityLeft.toString();
                        });
                    });
                }
                else {
                    $scope.distributionPlanItems = [];
                }
            }
            setDatePickers();
        });

    })
    .factory('Districts', function () {
        return {
            getAllDistricts: function () {
                return  ['Buikwe', 'Bukomansimbi', 'Butambala', 'Buvuma', 'Gomba', 'Kalangala', 'Kalungu', 'Oyam',
                    'Kampala', 'Kayunga', 'Kiboga', 'Kyankwanzi', 'Luweero', 'Lwengo', 'Lyantonde', 'Masaka', 'Otuke',
                    'Mityana', 'Mpigi', 'Mubende', 'Mukono', 'Nakaseke', 'Nakasongola', 'Rakai', 'Soroti', 'Tororo',
                    'Sembabule', 'Wakiso', 'Amuria', 'Budaka', 'Bududa', 'Bugiri', 'Bukedea', 'Sironko', 'Zombo',
                    'Bukwa', 'Bulambuli', 'Busia', 'Butaleja', 'Buyende', 'Iganga', 'Jinja', 'Serere', 'Yumbe',
                    'Kaberamaido', 'Kaliro', 'Kamuli', 'Kapchorwa', 'Katakwi', 'Kibuku', 'Kumi', 'Pallisa', 'Pader',
                    'Kween', 'Luuka', 'Manafwa', 'Mayuge', 'Mbale', 'Namayingo', 'Namutumba', 'Ngora', 'Nwoya', 'Nebbi',
                    'Napak', 'Nakapiripirit', 'Moyo', 'Moroto', 'Maracha', 'Lira', 'Lamwo', 'Kotido', 'Kole', 'Koboko',
                    'Kitgum', 'Kaabong', 'Gulu', 'Dokolo', 'Arua', 'Apac', 'Amuru', 'Amudat', 'Amolatar', 'Alebtong',
                    'Agago', 'Adjumani', 'Abim', 'Buhweju', 'Buliisa', 'Bundibugyo', 'Bushenyi', 'Hoima', 'Ibanda',
                    'Isingiro', 'Kabale', 'Kabarole', 'Kamwenge', 'Kanungu', 'Kasese', 'Kibaale', 'Kiruhura', 'Kisoro',
                    'Kiryandongo', 'Kyegegwa', 'Kyenjojo', 'Masindi', 'Mbarara', 'Mitooma', 'Ntoroko', 'Ntungamo',
                    'Rubirizi', 'Rukungiri', 'Sheema', 'Central Region', 'Eastern Region', 'Northern Region',
                    'Western Region'];
            }
        };
    })
    .directive('searchContacts', function ($http, EumsConfig, ContactService, $timeout) {
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
                        ContactService.getContactsBySearchQuery(query.term).then(function (foundContacts) {
                            data.results = formatResponse(foundContacts);
                            query.callback(data);
                        });
                    },
                    initSelection: function (element, callback) {
                        $timeout(function () {
                            var modelValue = ngModel.$modelValue;
                            if (modelValue) {
                                ContactService.getContactById(modelValue).then(function (contact) {
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
    });