'use strict';

angular.module('ReportedByIP', ['ngTable', 'siTable', 'PurchaseOrder', 'User', 'Directives'])
    .controller('IPPurchaseOrdersController', function ($scope, $location, PurchaseOrderService, UserService, $sorter) {
        $scope.sortBy = $sorter;
        $scope.purchaseOrders = [];

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('orderNumber');
            this.sort.descending = false;

            UserService.getCurrentUser().then(function (user) {
                PurchaseOrderService.forUser(user).then(function (purchaseOrders) {
                    $scope.purchaseOrders = purchaseOrders.sort();
                    angular.element('#loading').modal('hide');
                });
            });
        };

        $scope.sortArrowClass = function (criteria) {
            var output = '';
            if (this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if (this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.selectPurchaseOrder = function (selectedPurchaseOrder) {
            $location.path('/ip-delivery-report/new/' + selectedPurchaseOrder.id);
        };
    });

angular.module('NewIpReport', ['PurchaseOrder', 'User', 'DistributionPlanNode', 'Consignee', 'eums.ip', 'Contact', 'PurchaseOrderItem'])
    .controller('NewIpDeliveryController', function ($scope, $routeParams, PurchaseOrderService, UserService, $location,
                                                     DistributionPlanNodeService, IPService, ConsigneeService, PurchaseOrderItemService) {
        $scope.districts = $scope.consignees = $scope.deliveryNodes = [];

        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
        });

        ConsigneeService.all().then(function (consignees) {
            $scope.consignees = consignees;
        });

        var fieldsToBuild = ['purchaseorderitem_set.item.unit'];
        PurchaseOrderService.get($routeParams.purchaseOrderId, fieldsToBuild).then(function (purchaseOrder) {
            $scope.selectedPurchaseOrder = purchaseOrder;
            $scope.purchaseOrderItems = purchaseOrder.purchaseorderitemSet;
        });

        $scope.selectPurchaseOrderItem = function (purchaseOrderItem) {
            $location.path('/ip-delivery-report/new/' + $routeParams.purchaseOrderId + '/' + purchaseOrderItem.id);
            $scope.selectedPurchaseOrderItem = purchaseOrderItem;
            loadDeliveryNodes(purchaseOrderItem).then(function (deliveryNodes) {
                $scope.deliveryNodes = deliveryNodes;
            });
        };

        var purchaseOrderItemId = $routeParams.purchaseOrderItemId;
        purchaseOrderItemId && PurchaseOrderItemService.get(purchaseOrderItemId).then($scope.selectPurchaseOrderItem);

        $scope.addContact = function (node) {
            $scope.$broadcast('add-contact', node)
        };

        $scope.$on('contact-saved', function (event, contact, node) {
            node.contactPersonId = contact;
            $scope.$broadcast('set-contact-for-node', node.id, contact);
            event.stopPropagation();
        });

        function loadDeliveryNodes(purchaseOrderItem) {
            return UserService.getCurrentUser().then(function (user) {
                var filterParams = {consignee: user.consignee_id, item: purchaseOrderItem.id};
                return DistributionPlanNodeService.filter(filterParams, ['consignee', 'contact_person_id', 'children']);
            });
        }
    });