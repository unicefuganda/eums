'use strict';

angular.module('ManualReporting', ['ngTable', 'siTable'])
    .controller('ManualReportingController', function($sorter, $scope) {
        $scope.sortBy = $sorter;
        $scope.contact = {};
        $scope.errorMessage = '';
        $scope.planId = '';

        $scope.salesOrders = [];
        $scope.programmes = [];
        $scope.programmeSelected = null;

        $scope.initialize = function() {
            this.sortBy('date');
            this.sort.descending = false;
            $scope.purchaseOrders = [
                {order_number: 1, date: '2013-01-01', description: 'Some Description'},
                {order_number: 2, date: '2013-01-01', description: 'Some Description'},
                {order_number: 3, date: '2013-01-01', description: 'Some Description'},
                {order_number: 4, date: '2013-01-01', description: 'Some Description'},
                {order_number: 5, date: '2013-01-01', description: 'Some Description'},
                {order_number: 6, date: '2013-01-01', description: 'Some Description'}
            ];
        };

        $scope.sortArrowClass = function(criteria) {
            var output = 'glyphicon glyphicon-arrow-down';

            if(this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if(this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.selectPurchaseOrder = function(selectedPurchaseOrder) {
            console.log('**************', 'Purchase order selected', selectedPurchaseOrder, '**************');
        };
    })
    .filter('purchaseOrderFilter', function($filter) {
        return  function(purchaseOrders, query) {
            var results = $filter('filter')(purchaseOrders, {order_number: query});
            results = _.union(results, $filter('filter')(purchaseOrders, {date: query}));
            results = _.union(results, $filter('filter')(purchaseOrders, {description: query}));
            return results;
        };
    });
