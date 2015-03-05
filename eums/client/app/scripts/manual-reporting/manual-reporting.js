'use strict';

angular.module('ManualReporting', ['ngTable', 'siTable', 'NewDistributionPlan', 'eums.ip', 'PurchaseOrder', 'ReleaseOrder'])
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
    .controller('ManualReportingController', function ($sorter, $scope, $q, $location, DistributionReportingParameters, IPService, $timeout, PurchaseOrderService, ReleaseOrderService) {
        $scope.sortBy = $sorter;
        $scope.datepicker = {};
        // Should be in another controller
        $scope.document = DistributionReportingParameters.retrieveVariable('selectedPurchaseOrder');
        $scope.currentDocumentType = DistributionReportingParameters.retrieveVariable('currentDocumentType');
        $scope.documentItemSelected = undefined;
        IPService.loadAllDistricts().then(function (response) {
            $scope.districts = response.data.map(function (district) {
                return {id: district, name: district};
            });
        });
        var purchaseOrders = [];
        var waybills = [];

        $scope.initialize = function () {
            angular.element('#loading').modal();

            this.sortBy('order_number');
            this.sort.descending = false;

            var documentPromises = [];

            documentPromises.push(
                PurchaseOrderService.getPurchaseOrders().then(function (responses) {
                    purchaseOrders = responses;
                })
            );

            documentPromises.push(
                ReleaseOrderService.getReleaseOrders().then(function (responses) {
                    responses.forEach(function (response) {
                        response.date = response.delivery_date;
                    });
                    waybills = responses;
                })
            );

            $q.all(documentPromises).then( function(){
                $scope.toggleDocumentType('PO');
                angular.element('#loading').modal('hide');
            });
        };

        $scope.toggleDocumentType = function (type) {
            $scope.currentDocumentType = type;
            DistributionReportingParameters.saveVariable('currentDocumentType', type);
            if (type === 'PO') {
                $scope.documents = purchaseOrders;
            }
            else {
                $scope.documents = waybills;
            }
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

        $scope.selectDocument = function (document) {
            var orderDetails = {
                id: document.id, order_number: document.doc_number, date: document.date, programme: document.programme,
                items: [
                    {id: 1, description: 'Printer cartridges HP 21', materialCode: '213442', quantity: 20, unit: 'each',
                        responses: [
                            {
                                received: 'YES',
                                quantity: 30,
                                consignee: 'Jinja Hospital',
                                dateReceived: '01/10/2014',
                                quality: 'Damaged',
                                location: 'Jinja',
                                remark: ''
                            }
                        ]},
                    {id: 2, description: 'School Books', materialCode: '2123342', quantity: 100, unit: 'cartons', responses: [
                        {
                            received: 'NO',
                            quantity: '',
                            consignee: 'Director Shimoni',
                            dateReceived: '',
                            quality: '',
                            location: 'Wakiso',
                            remark: '2 weeks delay'
                        }
                    ]},
                    {id: 1, description: 'Dell Computers', materialCode: '21346256', quantity: 500, unit: 'each', responses: [
                        {
                            received: 'YES',
                            quantity: 23,
                            consignee: 'Head Teacher Nyakasura',
                            dateReceived: '01/10/2014',
                            quality: 'Substandard',
                            location: 'Buvuma',
                            remark: ''
                        }
                    ]},
                    {id: 1, description: 'School text books', materialCode: '56787562', quantity: 600, unit: 'each', responses: [
                        {
                            received: 'NO',
                            quantity: '',
                            consignee: 'Director KPS',
                            dateReceived: '',
                            quality: '',
                            location: 'Kampala',
                            remark: 'No response from IP'
                        }
                    ]}
                ]};
            DistributionReportingParameters.saveVariable('selectedPurchaseOrder', orderDetails);
            $location.path('/field-verification-report/details/');
        };

        $scope.$watch('currentDocumentType', function(){
             $scope.placeHolderText = 'Search by purchase order number, date or programme';
           if($scope.currentDocumentType === 'WB'){
               $scope.placeHolderText = 'Search by waybill number, date or programme';
           }

        });

        function setDatePickers(){
            $scope.datepicker = {};
            $scope.documentItemSelected.responses.forEach(function (item, index) {
                $scope.datepicker[index] = false;
            });
        }

        $scope.addResponse = function () {
            $scope.documentItemSelected.responses.push({
                received: '',
                quantity: '',
                consignee: '',
                dateReceived: '',
                quality: '',
                location: ''
            });
            setDatePickers();
        };

        $scope.saveResponses = function () {
            $scope.reportSaved = true;
            $timeout(function () {
                $scope.reportSaved = false;
            }, 2000);
        };
    })
    .filter('documentFilter', function ($filter) {
        return  function (documents, query) {
            var results = $filter('filter')(documents, {doc_number: query});
            results = _.union(results, $filter('filter')(documents, {date: query}));
            results = _.union(results, $filter('filter')(documents, {programme: query}));
            return results;
        };
    });
