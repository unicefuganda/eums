'use strict';

angular.module('NewDistributionPlan', ['DistributionPlan', 'eums.config', 'ngTable', 'siTable', 'Programme', 'SalesOrderItem', 'DistributionPlanNode', 'ui.bootstrap', 'Consignee', 'User'])
    .controller('NewDistributionPlanController', function($scope, DistributionPlanParameters, SalesOrderItemService, DistributionPlanLineItemService, DistributionPlanService, DistributionPlanNodeService, Districts, ConsigneeService, UserService) {

        $scope.districts = Districts.getAllDistricts().map(function(district) {
            return {id: district, name: district};
        });
        ConsigneeService.fetchConsignees().then(function(consignees) {
            $scope.consignees = consignees;
        });

        $scope.salesOrderItems = [];
        $scope.distributionPlanItems = [];

        $scope.changeSelectedSalesOrderItem = function(selectedSalesOrderItem) {
            $scope.salesOrderItemSelected = selectedSalesOrderItem;
        };

        $scope.initialize = function() {
            $scope.salesOrderItemSelected = undefined;
            $scope.hasSalesOrderItems = false;
            $scope.hasDistributionPlanItems = false;

            $scope.selectedSalesOrder = DistributionPlanParameters.retrieveVariable('selectedSalesOrder');
            $scope.programmeSelected = DistributionPlanParameters.retrieveVariable('programmeSelected');

            $scope.selectedSalesOrder.salesorderitem_set.forEach(function(salesOrderItem) {
                SalesOrderItemService.getSalesOrderItem(salesOrderItem).then(function(result) {
                    var formattedSalesOrderItem = {display: result.item.description,
                        material_code: result.item.material_code,
                        quantity: result.quantity,
                        quantityLeft: result.quantity,
                        unit: result.item.unit.name,
                        information: result};

                    $scope.salesOrderItems.push(formattedSalesOrderItem);
                });
            });
        };

        $scope.hasTargetedQuantity = function(distributionPlanLineItem) {
            var showInputBox = ['', undefined, '0', 0];
            return (showInputBox.indexOf(distributionPlanLineItem.targeted_quantity) === -1);
        };

        $scope.addDistributionPlanItem = function() {
            var distributionPlanLineItem = {item: $scope.salesOrderItemSelected.information.item,
                quantity: $scope.salesOrderItemSelected.quantityLeft, planned_distribution_date: '2014-10-10',
                targeted_quantity: 0, destination_location: '', mode_of_delivery: '',
                contact_phone_number: '', programme_focal: '', contact_person: '', tracked: false};

            var currentDistributionPlanItems = $scope.distributionPlanItems;
            currentDistributionPlanItems.push(distributionPlanLineItem);

            if(currentDistributionPlanItems && currentDistributionPlanItems.length > 0) {
                $scope.hasDistributionPlanItems = true;
            }

            $scope.distributionPlanItems = currentDistributionPlanItems;
        };

        function saveNodeAndLineItems(nodeDetails, distributionPlanItem) {
            DistributionPlanNodeService.createNode(nodeDetails).then(function(response) {
                var lineItemDetails = {item: distributionPlanItem.item.id, targeted_quantity: distributionPlanItem.target_quantity,
                    distribution_plan_node: response.id, planned_distribution_date: distributionPlanItem.planned_distribution_date,
                    programme_focal: distributionPlanItem.programme_focal.id, consignee: distributionPlanItem.consignee.id,
                    contact_person: distributionPlanItem.contact_person, contact_phone_number: distributionPlanItem.contact_phone_number,
                    destination_location: distributionPlanItem.destination_location, mode_of_delivery: distributionPlanItem.mode_of_delivery,
                    tracked: distributionPlanItem.tracked, remark: distributionPlanItem.remark};
                DistributionPlanLineItemService.createLineItem(lineItemDetails);
            });
        }

        function saveScopeVariables(distributionPlanItems) {
            $scope.salesOrderItemSelected.quantityLeft = $scope.salesOrderItemSelected.quantity;
            $scope.distributionPlanItems = distributionPlanItems;
        }

        $scope.saveDistributionPlanItem = function(distributionPlanItems) {
            if($scope.planId === undefined) {
                DistributionPlanService.createPlan({programme: $scope.selectedSalesOrder.programme}).then(function(result) {
                    $scope.planId = result.id;
                });
            }
            saveScopeVariables(distributionPlanItems);

            $scope.distributionPlanItems.forEach(function(distributionPlanItem) {
                var nodeDetails = {consignee: distributionPlanItem.consignee.id,
                    distribution_plan: $scope.planId, tree_position: 'END_USER'};

                $scope.salesOrderItemSelected.quantityLeft = (parseInt($scope.salesOrderItemSelected.quantityLeft) - parseInt(distributionPlanItem.target_quantity)).toString();
                saveNodeAndLineItems(nodeDetails, distributionPlanItem);
            });
        };

        $scope.hasItemsLeft = function() {
            var emptySalesOrders = ['', undefined];
            if(emptySalesOrders.indexOf($scope.salesOrderItemSelected) === -1) {
                return parseInt($scope.salesOrderItemSelected.quantityLeft) !== 0;
            }

            return true;
        };

        $scope.$watch('salesOrderItemSelected', function() {
            var emptySalesOrders = ['', undefined];

            if(emptySalesOrders.indexOf($scope.salesOrderItemSelected) !== -1) {
                $scope.hasSalesOrderItems = false;
            }
            else {
                $scope.hasSalesOrderItems = true;
                $scope.salesOrderItemSelected.quantityLeft = $scope.salesOrderItemSelected.quantity;

                var distributionPlanLineItems = $scope.salesOrderItemSelected.information.distributionplanlineitem_set;

                if(distributionPlanLineItems && distributionPlanLineItems.length > 0) {
                    $scope.hasDistributionPlanItems = true;
                    var itemCounter = 0;
                    var quantityLeft = parseInt($scope.salesOrderItemSelected.quantity);

                    distributionPlanLineItems.forEach(function(planLineItemID) {
                        DistributionPlanLineItemService.getLineItemDetails(planLineItemID).then(function(result) {
                            ConsigneeService.getConsigneeById(result.consignee).then(function(consignee) {
                                result.consignee = consignee.name;
                            });

                            UserService.getUserById(result.programme_focal).then(function(user) {
                                result.programme_focal = user.firstName + ' ' + user.lastName;
                            });
                            result.quantity = quantityLeft.toString();
                            result.target_quantity = result.targeted_quantity;
                            $scope.distributionPlanItems.push(result);
                            if(itemCounter === 0) {
                                DistributionPlanNodeService.getPlanNodeDetails(result.distribution_plan_node).then(function(nodeInformation) {
                                    $scope.planId = nodeInformation.distribution_plan;
                                });
                            }
                            quantityLeft = quantityLeft - parseInt(result.targeted_quantity);
                            itemCounter++;
                            $scope.salesOrderItemSelected.quantityLeft = quantityLeft.toString();
                        });
                    });
                }
                else {
                    $scope.distributionPlanItems = [];
                }
            }
        });


        $scope.$watch('distributionPlanItem.consignee', function() {
            // TO DO: Change the contact_persons in the scope when the consignee changes
//            $scope.consignees =
        });

        $scope.$watch('distributionPlanItem.contact_person', function() {
            // TO DO: Change the contact_phone_number in the scope when the contact_person changes
//            $scope.consignees =
        });

    }).factory('Districts', function() {
        return {
            getAllDistricts: function() {
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
    }).directive('searchContacts', function($http, EumsConfig, ContactService) {
        function formatResponse(data) {
            return data.map(function(contact) {
                return {
                    id: contact._id,
                    text: contact.firstName + ' ' + contact.lastName + ', ' + contact.phone
                };
            });
        }

        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element) {
                element.select2({
                    minimumInputLength: 1,
                    width: '150px',
                    query: function(query) {
                        var data = {results: []};
                        ContactService.getContactsBySearchQuery(query.term).then(function(foundContacts) {
                            data.results = formatResponse(foundContacts);
                            query.callback(data);
                        });
                    }
                });

                element.change(function() {
                    scope.distributionPlanItem.contact_person = element.select2('data').id;
                    scope.$apply();
                });
            }
        };
    }).directive('searchFromList', function() {
        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                var list = JSON.parse(attrs.list);

                element.select2({
                    minimumInputLength: 1,
                    width: '150px',
                    query: function(query) {
                        var data = {results: []};
                        var matches = list.filter(function(item) {
                            return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                        });
                        data.results = matches.map(function(match) {
                            return {
                                id: match.id,
                                text: match.name,
                            };
                        });
                        query.callback(data);
                    }
                });

                element.change(function() {
                    ngModel.$setViewValue(element.select2('data').id);
                    scope.$apply();
                });
            }
        };
    });