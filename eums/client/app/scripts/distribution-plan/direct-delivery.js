'use strict';


angular.module('DirectDelivery', ['eums.config', 'DistributionPlanNode', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives'])
    .controller('DirectDeliveryController', function ($scope, $location, DistributionPlanService, ProgrammeService, PurchaseOrderService, UserService, $sorter) {

        $scope.sortBy = $sorter;
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.purchaseOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.documentColumnTitle = 'Purchase Order';
        $scope.dateColumnTitle = 'Date Created';

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('order_number');
            this.sort.descending = false;

            PurchaseOrderService.forDirectDelivery().then(function (purchaseOrders) {
                $scope.purchaseOrders = purchaseOrders.sort();
                angular.element('#loading').modal('hide');
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
            $location.path('/direct-delivery/' + selectedPurchaseOrder.id);
        };

    })
    .filter('purchaseOrderFilter', function ($filter) {
        return function (salesOrders, query) {
            var results = $filter('filter')(salesOrders, {order_number: query});
            results = _.union(results, $filter('filter')(salesOrders, {date: query}));
            return results;
        };
    }).factory('$sorter', function () {
        return function (field) {
            this.sort = this.sort || {};
            angular.extend(this.sort, {criteria: field, descending: !this.sort.descending});
        };
    });

