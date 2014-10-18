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
                {order_number: 65025072, date: '12/13/2012', description: 'Printer cartridges HP 21'},
                {order_number: 65025072, date: '2/14/2013', description: 'Printer Cartridge HP 22'},
                {order_number: 65025496, date: '2/14/2013', description: 'HP LaserJet Printer - P3015DN'},
                {order_number: 65025623, date: '3/3/2013', description: 'Repair of HP printer 2024dn'},
                {order_number: 65026064, date: '3/3/2013', description: 'Servicing of Fax'},
                {order_number: 65026445, date: '3/25/2013', description: 'HP Toner 11A'}
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
