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
    .controller('ManualReportingController', function ($sorter, $scope, $location, DistributionReportingParameters, Districts, $timeout) {
        $scope.sortBy = $sorter;

        // Should be in another controller
        $scope.document = DistributionReportingParameters.retrieveVariable('selectedPurchaseOrder');
        $scope.currentDocumentType = DistributionReportingParameters.retrieveVariable('currentDocumentType');
        $scope.documentItemSelected = undefined;
        $scope.districts = Districts.getAllDistricts().map(function (district) {
            return {id: district, name: district};
        });
        var purchaseOrders = [];
        var waybills = [];

        $scope.initialize = function () {
            this.sortBy('date');
            this.sort.descending = false;
            purchaseOrders = [
                {id: 1, doc_number: 65025072, date: '11/11/2014', programme: 'Keep Chlidren Learning'},
                {id: 2, doc_number: 65025073, date: '2/10/2013', programme: 'Safe'},
                {id: 3, doc_number: 65025496, date: '12/03/2013', programme: 'Alive'},
                {id: 4, doc_number: 65025623, date: '3/3/2013', programme: 'Safe'},
                {id: 5, doc_number: 65026064, date: '2/3/2014', programme: 'Alive'},
                {id: 6, doc_number: 65026445, date: '4/21/2014', programme: 'Mothers'}
            ];
            waybills = [
                {id: 1, doc_number: 72081598, date: '12/13/2012', programme: 'Alive'},
                {id: 2, doc_number: 72994735, date: '2/14/2013', programme: 'Safe'},
                {id: 3, doc_number: 34839344, date: '2/14/2013', programme: 'Alive'},
                {id: 4, doc_number: 20038445, date: '3/3/2013', programme: 'Alive'},
                {id: 5, doc_number: 90384434, date: '3/3/2013', programme: 'Safe'},
                {id: 6, doc_number: 10293800, date: '3/25/2013', programme: 'Mothers'}
            ];
            $scope.toggleDocumentType('PO');
        };
        
        $scope.toggleDocumentType = function(type) {
            $scope.currentDocumentType = type;
            DistributionReportingParameters.saveVariable('currentDocumentType', type);
            if(type === 'PO') {
                $scope.documents = purchaseOrders;
            }
            else {
                $scope.documents = waybills;
            }
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

        $scope.selectDocument = function (document) {
            var orderDetails = {
                id: document.id, order_number: document.doc_number, date: document.date, programme: document.programme,
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
                    {id: 1, description: 'Printer cartridges HP 24', material_code: '56787562', quantity: 600, unit: 'kgs'}
                ]};
            DistributionReportingParameters.saveVariable('selectedPurchaseOrder', orderDetails);
            $location.path('/distribution-reporting/details/');
        };

        $scope.addResponse = function () {
            $scope.documentItemSelected.responses.push({
                received: '',
                quantity: '',
                consignee: '',
                dateReceived: '',
                quality: '',
                location: ''
            });
        };

        $scope.saveResponses = function() {
            $scope.reportSaved = true;
            $timeout(function() {
                $scope.reportSaved = false;
            }, 2000);
        };
    })
    .filter('documentFilter', function ($filter) {
        return  function (documents, query) {
            var results = $filter('filter')(documents, {order_number: query});
            results = _.union(results, $filter('filter')(documents, {date: query}));
            results = _.union(results, $filter('filter')(documents, {description: query}));
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
