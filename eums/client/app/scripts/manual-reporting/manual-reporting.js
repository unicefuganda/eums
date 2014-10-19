'use strict';

angular.module('ManualReporting', ['ngTable', 'siTable', 'NewDistributionPlan'])
    .factory('DistributionReportingParameters', function () {
        var distributionReportingParameters = {};
        return{
            saveVariable: function (key, value) {
                distributionReportingParameters[key] = value;
            },
            retrieveVariable: function (key) {
                return distributionReportingParameters[key];
            }
        };
    })
    .controller('ManualReportingController', function ($sorter, $scope, $location, PurchaseOrderService, DistributionReportingParameters, Districts) {
        $scope.sortBy = $sorter;

        // Should be in another controller
        $scope.document = DistributionReportingParameters.retrieveVariable('selectedPurchaseOrder');
        $scope.documentItemSelected = undefined;
        $scope.districts = Districts.getAllDistricts().map(function (district) {
            return {id: district, name: district};
        });

        $scope.initialize = function () {
            this.sortBy('date');
            this.sort.descending = false;
            $scope.purchaseOrders = [
                {id: 1, order_number: 65025072, date: '12/13/2012', description: 'Printer cartridges HP 21'},
                {id: 2, order_number: 65025073, date: '2/14/2013', description: 'Printer Cartridge HP 22'},
                {id: 3, order_number: 65025496, date: '2/14/2013', description: 'HP LaserJet Printer - P3015DN'},
                {id: 4, order_number: 65025623, date: '3/3/2013', description: 'Repair of HP printer 2024dn'},
                {id: 5, order_number: 65026064, date: '3/3/2013', description: 'Servicing of Fax'},
                {id: 6, order_number: 65026445, date: '3/25/2013', description: 'HP Toner 11A'}
            ];
        };

        $scope.sortArrowClass = function (criteria) {
            var output = 'glyphicon glyphicon-arrow-down';

            if (this.sort.criteria === criteria) {
                output = 'active glyphicon glyphicon-arrow-down';
                if (this.sort.descending) {
                    output = 'active glyphicon glyphicon-arrow-up';
                }
            }
            return output;
        };

        $scope.selectPurchaseOrder = function (selectedPurchaseOrder) {
            console.log('**************', 'Purchase order selected', selectedPurchaseOrder, '**************');
            var orderDetails = {id: 1, order_number: 6654353, date: '2014-10-03', description: 'Printer cartridges HP 21', programme: 'Safe programme',
                items: [
                    {id: 1, description: 'Printer cartridges HP 21', material_code: '213442', quantity: 20, unit: 'kgs',
                        responses: [
                            {
                                received: 'Yes',
                                quantity: 30,
                                consignee: 'Jinja Hospital',
                                dateReceived: '01/10/2014',
                                quality: 'Damaged',
                                location: 'Jinja'
                            }
                        ]},
                    {id: 2, description: 'Printer cartridges HP 22', material_code: '2123342', quantity: 100, unit: 'kgs'},
                    {id: 1, description: 'Printer cartridges HP 23', material_code: '21346256', quantity: 500, unit: 'kgs'},
                    {id: 1, description: 'Printer cartridges HP 24', material_code: '56787562', quantity: 600, unit: 'kgs'},
                ]};
            DistributionReportingParameters.saveVariable('selectedPurchaseOrder', orderDetails);
            $location.path('/distribution-reporting/details/');
        };

    })
    .filter('purchaseOrderFilter', function ($filter) {
        return  function (purchaseOrders, query) {
            var results = $filter('filter')(purchaseOrders, {order_number: query});
            results = _.union(results, $filter('filter')(purchaseOrders, {date: query}));
            results = _.union(results, $filter('filter')(purchaseOrders, {description: query}));
            return results;
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
                    width: '150px',
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
