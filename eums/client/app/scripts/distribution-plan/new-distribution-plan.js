'use strict';

angular.module('NewDistributionPlan', ['DistributionPlan', 'eums.config', 'ngTable', 'siTable', 'Programme', 'SalesOrderItem', 'DistributionPlanNode', 'ui.bootstrap', 'Consignee', 'User', 'SalesOrder', 'eums.ip'])
    .controller('NewDistributionPlanController', function($scope, DistributionPlanParameters, SalesOrderItemService, DistributionPlanLineItemService, DistributionPlanService, DistributionPlanNodeService, ConsigneeService, $q, SalesOrderService, $routeParams, IPService) {

        $scope.datepicker = {};
        $scope.districts = [];

        IPService.loadAllDistricts().then(function(response) {
            $scope.districts = response.data.map(function(district) {
                return {id: district, name: district};
            });
        });

        ConsigneeService.fetchConsignees().then(function(consignees) {
            $scope.consignees = consignees;
        });

        $scope.distributionPlanItems = [];
        $scope.salesOrderItems = [];

        SalesOrderService.getSalesOrder($routeParams.salesOrderId).then(function (response) {
            $scope.selectedSalesOrder = response;

            $scope.selectedSalesOrder.salesorderitem_set.forEach(function(salesOrderItem) {
                SalesOrderItemService.getSalesOrderItem(salesOrderItem).then(function(result) {
                    var formattedSalesOrderItem = {
                        display: result.item.description,
                        materialCode: result.item.material_code,
                        quantity: result.quantity,
                        unit: result.item.unit.name,
                        information: result
                    };
                    formattedSalesOrderItem.quantityLeft = computeQuantityLeft(formattedSalesOrderItem);

                    $scope.salesOrderItems.push(formattedSalesOrderItem);
                });
            });
        });

        $scope.addDistributionPlanItem = function() {
            var distributionPlanLineItem = {
                item: $scope.selectedSalesOrderItem.information.item,
                plannedDistributionDate: '2014-10-10',
                targetQuantity: 0,
                destinationLocation: '',
                contactPerson: '',
                modeOfDelivery: '',
                tracked: false
            };

            $scope.distributionPlanItems.push(distributionPlanLineItem);

            setDatePickers();
        };

        function computeQuantityLeft(salesOrderItem) {
            var reduced = $scope.distributionPlanItems.reduce(function(previous, current) {
                return {targetQuantity: previous.targetQuantity + current.targetQuantity};
            }, {targetQuantity: 0});

            return salesOrderItem.quantity - reduced.targetQuantity;
        }

        $scope.$watchCollection('distributionPlanItems', function(newPlanItems) {
            if(newPlanItems.length) {
                $scope.selectedSalesOrderItem.quantityLeft = computeQuantityLeft($scope.selectedSalesOrderItem);
            }
        });

        function setDatePickers() {
            $scope.datepicker = {};
            $scope.distributionPlanItems.forEach(function(item, index) {
                $scope.datepicker[index] = false;
            });
        }

        function saveNode(uiPlanItem) {
            var nodeId = uiPlanItem.nodeId;
            var node = {
                consignee: uiPlanItem.consignee,
                location: uiPlanItem.destinationLocation,
                contact_person_id: uiPlanItem.contactPerson,
                distribution_plan: $scope.distributionPlan.id,
                tree_position: 'MIDDLE_MAN',
                mode_of_delivery: uiPlanItem.modeOfDelivery
            };

            if(nodeId) {
                node.id = nodeId;
                return  DistributionPlanNodeService.updateNode(node);
            }
            else {
                return DistributionPlanNodeService.createNode(node);
            }
        }

        function saveLineItem(uiPlanItem, nodeId) {
            var lineItemId = uiPlanItem.lineItemId;
            var plannedDate = new Date(uiPlanItem.plannedDistributionDate);
            uiPlanItem.plannedDistributionDate = plannedDate.getFullYear() + '-' + (plannedDate.getMonth() + 1) + '-' + plannedDate.getDate();
            var lineItem = {
                item: uiPlanItem.item.id,
                targeted_quantity: uiPlanItem.targetQuantity,
                distribution_plan_node: nodeId,
                planned_distribution_date: uiPlanItem.plannedDistributionDate,
                remark: uiPlanItem.remark
            };

            if(lineItemId) {
                lineItem.id = lineItemId;
                DistributionPlanLineItemService.updateLineItem(lineItem);
            }
            else {
                DistributionPlanLineItemService.createLineItem(lineItem).then(function(createdLineItem) {
                    uiPlanItem.lineItemId = createdLineItem.id;
                });
            }
        }

        function saveDistributionPlanItems() {
            $scope.distributionPlanItems.forEach(function(item) {
                saveNode(item).then(function(createdNode) {
                    item.nodeId = createdNode.id;
                    saveLineItem(item, createdNode.id);
                });
            });
        }

        $scope.saveDistributionPlanItems = function() {
            if($scope.distributionPlan) {
                saveDistributionPlanItems();
            }
            else {
                DistributionPlanService.createPlan({programme: $scope.selectedSalesOrder.programme}).then(function(createdPlan) {
                    $scope.distributionPlan = createdPlan;
                    saveDistributionPlanItems();
                });
            }
        };

        $scope.$watch('selectedSalesOrderItem', function(newItem) {
            $scope.distributionPlanItems = [];
            $scope.selectedSalesOrderItem = newItem;

            var distributionPlanLineItems = $scope.selectedSalesOrderItem && $scope.selectedSalesOrderItem.information.distributionplanlineitem_set;

            if(distributionPlanLineItems && distributionPlanLineItems.length) {
                var itemCounter = 0;
                var quantityLeft = parseInt($scope.selectedSalesOrderItem.quantity);

                //TODO Clean this up. Get fully populated objects from endpoint
                distributionPlanLineItems.forEach(function(lineItemId) {
                    DistributionPlanLineItemService.getLineItem(lineItemId).then(function(lineItem) {
                        lineItem.quantity = quantityLeft.toString();
                        lineItem.targetQuantity = lineItem.targeted_quantity;
                        lineItem.lineItemIdInBackend = lineItem.id;

                        var d = new Date(lineItem.planned_distribution_date);
                        lineItem.plannedDistributionDate = d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear();

                        DistributionPlanNodeService.getPlanNodeDetails(lineItem.distribution_plan_node).then(function(node) {
                            lineItem.consignee = node.consignee.id;
                            lineItem.nodeId = node.id;
                            lineItem.contactPerson = node.contact_person._id;
                            lineItem.modeOfDelivery = node.mode_of_delivery;
                            lineItem.destinationLocation = node.location;
                            lineItem.alreadySaved = true;
                            lineItem.subConsignees = [
                                {}
                            ];

                            $scope.distributionPlanItems.push(lineItem);
                        });

                        quantityLeft = quantityLeft - parseInt(lineItem.targetQuantity);
                        itemCounter++;
                        $scope.selectedSalesOrderItem.quantityLeft = quantityLeft.toString();
                    });
                });
            }
            else {
                $scope.distributionPlanItems = [];
            }

            setDatePickers();
        });

    }).directive('searchContacts', function($http, EumsConfig, ContactService, $timeout) {
        function formatResponse(data) {
            return data.map(function(contact) {
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
            link: function(scope, element, _, ngModel) {

                element.select2({
                    minimumInputLength: 1,
                    width: '150px',
                    query: function(query) {
                        var data = {results: []};
                        ContactService.getContactsBySearchQuery(query.term).then(function(foundContacts) {
                            data.results = formatResponse(foundContacts);
                            query.callback(data);
                        });
                    },
                    initSelection: function(element, callback) {
                        $timeout(function() {
                            var modelValue = ngModel.$modelValue;
                            if(modelValue) {
                                ContactService.getContactById(modelValue).then(function(contact) {
                                    if(contact._id) {
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

                element.change(function() {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });
            }
        };
    })
    .directive('searchFromList', function($timeout) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                var list = JSON.parse(attrs.list);

                element.select2({
                    width: '100%',
                    query: function(query) {
                        var data = {results: []};
                        var matches = list.filter(function(item) {
                            return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                        });
                        data.results = matches.map(function(match) {
                            return {
                                id: match.id,
                                text: match.name
                            };
                        });
                        query.callback(data);
                    },
                    initSelection: function(element, callback) {
                        $timeout(function() {
                            var matchingItem = list.filter(function(item) {
                                return item.id === ngModel.$modelValue;
                            })[0];
                            if(matchingItem) {
                                callback({id: matchingItem.id, text: matchingItem.name});
                            }
                        });
                    }
                });

                element.change(function() {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });
            }
        };
    });