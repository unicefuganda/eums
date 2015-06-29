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
        $scope.poTypeColumnTitle = 'PO Type';
        $scope.outcomeColumnTitle = 'Outcome';

        $scope.initialize = function () {
            angular.element('#loading').modal();
            this.sortBy('orderNumber');
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
        return function (purchaseOrders, query) {
            var results = $filter('filter')(purchaseOrders, {orderNumber: query});
            results = _.union(results, $filter('filter')(purchaseOrders, {date: query}));
            return results;
        };
    }).factory('$sorter', function () {
        return function (field) {
            this.sort = this.sort || {};
            angular.extend(this.sort, {criteria: field, descending: !this.sort.descending});
        };
    });

