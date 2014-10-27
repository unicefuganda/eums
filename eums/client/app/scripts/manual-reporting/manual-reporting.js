'use strict';

angular.module('ManualReporting', ['ngTable', 'siTable', 'NewDistributionPlan', 'eums.ip'])
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
    .controller('ManualReportingController', function ($sorter, $scope, $location, DistributionReportingParameters, IPService, $timeout) {
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
            this.sortBy('doc_number');
            this.sort.descending = false;
            purchaseOrders = [
                {id: 1, doc_number: 65025072, date: '11/11/2014', programme: 'YI107 - PCR 3 KEEP CHILDREN SAFE'},
                {id: 2, doc_number: 65025073, date: '2/10/2013', programme: 'YI105 - PCR 1 KEEP CHILDREN AND MOTHERS'},
                {id: 3, doc_number: 65025496, date: '12/03/2013', programme: 'Y108 - PCR 4 CROSS SECTORAL'},
                {id: 4, doc_number: 65025623, date: '3/3/2013', programme: 'YP109 - PCR 5 SUPPORT'},
                {id: 5, doc_number: 65026064, date: '2/3/2014', programme: 'YI106 - PCR 2 KEEP CHILDREN LEARNING'},
                {id: 6, doc_number: 65026445, date: '4/21/2014', programme: 'YI101 KEEP CHILDREN AND MOTHERS ALIVE'}
            ];
            waybills = [
                {id: 1, doc_number: 72081598, date: '12/13/2012', programme: 'YI101 KEEP CHILDREN AND MOTHERS ALIVE'},
                {id: 2, doc_number: 72994735, date: '2/14/2013', programme: 'YI106 - PCR 2 KEEP CHILDREN LEARNING'},
                {id: 3, doc_number: 34839344, date: '2/14/2013', programme: 'YP109 - PCR 5 SUPPORT'},
                {id: 4, doc_number: 20038445, date: '3/3/2013', programme: 'YI107 - PCR 3 KEEP CHILDREN SAFE'},
                {id: 5, doc_number: 90384434, date: '3/3/2013', programme: 'Y108 - PCR 4 CROSS SECTORAL'},
                {id: 6, doc_number: 10293800, date: '3/25/2013', programme: 'YI106 - PCR 2 KEEP CHILDREN LEARNING'}
            ];
            $scope.toggleDocumentType('PO');
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
            $location.path('/distribution-reporting/details/');
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
