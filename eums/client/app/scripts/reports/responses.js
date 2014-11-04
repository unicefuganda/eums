'use strict';

angular.module('Responses', ['eums.config'])
    .controller('responsesController',function ($scope) {
        $scope.transactionShow = 0;

        $scope.consigneeId = 0;
        $scope.salesOrderItemId = 0;

        //   $scope.initialize = function () {
        //TODO: Remove commenting when test if fixed
        //ResponsesService.fetchResponses($scope.consigneeId, $scope.salesOrderItemId).then(function (responses) {
        //    $scope.responses = responses;
        // });
        // };

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

    }).factory('ResponsesService',function ($http, EumsConfig) {
        return {
            fetchResponses: function (consigneeId, salesOrderItemId) {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN_RESPONSES + consigneeId + '/sales_order_item_id/' + salesOrderItemId).then(function (response) {
                    return response.data;
                });
            }
        };
    }).directive('feedbackResponsesTable', function ($timeout) {
        return {
            link: function (scope, element) {
                $timeout(function () {
                    $(element).treegrid({
                        initialState: 'collapsed'
                    });
                });
            }
        };
    });



