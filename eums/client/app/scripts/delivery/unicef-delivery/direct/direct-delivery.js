'use strict';

angular.module('DirectDelivery', ['eums.config', 'ngTable', 'siTable', 'Programme', 'PurchaseOrder', 'User', 'Directives', 'EumsFilters', 'Loader'])
    .controller('DirectDeliveryController', function ($scope, $location, ProgrammeService, PurchaseOrderService, UserService, $sorter, LoaderService) {

        $scope.sortBy = $sorter;
        $scope.searchFields = ['orderNumber', 'date'];
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
            LoaderService.showLoader();
            this.sortBy('orderNumber');
            this.sort.descending = false;

            PurchaseOrderService.forDirectDelivery().then(function (purchaseOrders) {
                $scope.purchaseOrders = purchaseOrders.sort();
                LoaderService.hideLoader();
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
            $location.path('/direct-delivery/new/' + selectedPurchaseOrder.id);
        };

    })
    .factory('$sorter', function () {
        return function (field) {
            this.sort = this.sort || {};
            angular.extend(this.sort, {criteria: field, descending: !this.sort.descending});
        };
    });

