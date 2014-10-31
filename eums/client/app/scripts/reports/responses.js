'use strict';

angular.module('Responses', ['eums.config'])
    .controller('responsesController', function ($scope, $location, ResponsesService) {
        $scope.tableRowExpanded = false;
        $scope.tableRowIndexCurrExpanded = '';
        $scope.tableRowIndexPrevExpanded = '';
        $scope.storeIdExpanded = '';
        $scope.dayDataCollapse = [true, true, true, true, true, true];
        $scope.transactionShow = 0;

        $scope.consigneeId = 0;
        $scope.salesOrderItemId = 0;

        console.log($scope.consigneeId);
        $scope.initialize = function () {
            ResponsesService.fetchResponses($scope.consigneeId, $scope.salesOrderItemId).then(function (responses) {
                console.log('IN the initialization code');
                $scope.responses = responses;
            });
        };

        $scope.dayDataCollapseFn = function () {
            for (var i = 0; $scope.responsesDataModel.responsesData.length - 1; i += 1) {
                $scope.dayDataCollapse.append('true');
            }
        };


        $scope.selectTableRow = function (index, storeId) {
            if ($scope.dayDataCollapse === 'undefined') {
                $scope.dayDataCollapse = $scope.dayDataCollapseFn();
            } else {

                if ($scope.tableRowExpanded === false && $scope.tableRowIndexCurrExpanded === '' && $scope.storeIdExpanded === '') {
                    $scope.tableRowIndexPrevExpanded = '';
                    $scope.tableRowExpanded = true;
                    $scope.tableRowIndexCurrExpanded = index;
                    $scope.storeIdExpanded = storeId;
                    $scope.dayDataCollapse[index] = false;
                } else if ($scope.tableRowExpanded === true) {
                    if ($scope.tableRowIndexCurrExpanded === index && $scope.storeIdExpanded === storeId) {
                        $scope.tableRowExpanded = false;
                        $scope.tableRowIndexCurrExpanded = '';
                        $scope.storeIdExpanded = '';
                        $scope.dayDataCollapse[index] = true;
                    } else {
                        $scope.tableRowIndexPrevExpanded = $scope.tableRowIndexCurrExpanded;
                        $scope.tableRowIndexCurrExpanded = index;
                        $scope.storeIdExpanded = storeId;
                        $scope.dayDataCollapse[$scope.tableRowIndexPrevExpanded] = true;
                        $scope.dayDataCollapse[$scope.tableRowIndexCurrExpanded] = false;
                    }
                }
            }
        };

        $scope.responsesData = {
            'responsesData': [
                {
                    'ip': {
                        'consignee': 'GULU DHO', 'received': 'Yes',
                        'dateReceived': '10/10/2014',
                        'quantityReceived': '1000',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'They were delivered on time and in good condition'
                    },
                    'data': {
                        'consignee': 'Gulu General Hospital', 'received': 'Yes',
                        'dateReceived': '13/10/2014',
                        'quantityReceived': '700',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'They were not perfect but they helped a bit',
                        'dayData': [
                            {
                                'consignee': 'Nyandi HC III', 'received': 'Yes',
                                'dateReceived': '20/10/2014',
                                'quantityReceived': '250',
                                'quality': 'Expired',
                                'satisfied': 'No',
                                'comments': 'IT was of no help since the drugs were expired',
                                transactions: [
                                    {
                                        'consignee': 'Ntolo VHT', 'received': 'Yes',
                                        'dateReceived': '22/10/2014',
                                        'quantityReceived': '35',
                                        'quality': 'Expired',
                                        'satisfied': 'No',
                                        'comments': 'They were of no use'
                                    },
                                    {
                                        'consignee': 'Ntindi VHT', 'received': 'Yes',
                                        'dateReceived': '22/10/2014',
                                        'quantityReceived': '50',
                                        'quality': 'Expired',
                                        'satisfied': 'No',
                                        'comments': 'I had to throw them away'
                                    },
                                    {
                                        'consignee': 'Komponi VHT', 'received': 'Yes',
                                        'dateReceived': '22/10/2014',
                                        'quantityReceived': '100',
                                        'quality': 'expired',
                                        'satisfied': 'No',
                                        'comments': 'I could not risk giving out expired drugs'
                                    }
                                ]
                            },
                            {
                                'consignee': 'Nyango General Hospital', 'received': 'Yes',
                                'dateReceived': '15/10/2014',
                                'quantityReceived': '372',
                                'quality': 'Good',
                                'satisfied': 'Yes',
                                'comments': 'Timely delivery',
                                transactions: [
                                    {
                                        'consignee': 'Thambo VHT', 'received': 'Yes',
                                        'dateReceived': '16/10/2014',
                                        'quantityReceived': '35',
                                        'quality': 'Good',
                                        'satisfied': 'Yes',
                                        'comments': 'You are helping us save lives'
                                    },
                                    {'consignee': 'Ntinka VHT', 'received': 'Yes',
                                        'dateReceived': '16/10/2014',
                                        'quantityReceived': '21',
                                        'quality': 'Good',
                                        'satisfied': 'Yes',
                                        'comments': 'Thank you very much'
                                    },
                                    {'consignee': 'Nkaka Baracks', 'received': 'Yes',
                                        'dateReceived': '16/10/2014',
                                        'quantityReceived': '73',
                                        'quality': 'Fair',
                                        'satisfied': 'Yes',
                                        'comments': 'Some boxes reached when they were damaged'
                                    }
                                ]
                            }
                        ]
                    }
                }
            ],
            '_links': {
                'self': {
                    'href': '#'
                }
            }
        };

    }).factory('ResponsesService', function ($http, EumsConfig) {
        return {
            fetchResponses: function (consigneeId, salesOrderItemId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_RESPONSES + consigneeId + '/sales_order_item_id/' + salesOrderItemId).then(function (response) {
                    return response.data;
                });
            }
        };
    });



