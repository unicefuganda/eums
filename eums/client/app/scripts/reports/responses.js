'use strict';

angular.module('Responses', ['eums.config'])
    .controller('responsesController',function ($scope) {
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
                        'id': 16,
                        'consignee': 'Adjumani DHO', 'received': 'Yes',
                        'dateReceived': '14/10/2014',
                        'quantityReceived': '800',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'Received timely'
                    }
                },
                {
                    'ip': {
                        'id': 1,
                        'consignee': 'GULU DHO', 'received': 'Yes',
                        'dateReceived': '10/10/2014',
                        'quantityReceived': '1000',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'They were delivered on time and in good condition'
                    },
                    'data': {
                        'id': 2,
                        'consignee': 'Gulu General Hospital', 'received': 'Yes',
                        'dateReceived': '13/10/2014',
                        'quantityReceived': '700',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'They were not perfect but they helped a bit',
                        'dayData': [
                            {
                                'id': 3,
                                'consignee': 'Nyandi HC III', 'received': 'Yes',
                                'dateReceived': '20/10/2014',
                                'quantityReceived': '250',
                                'quality': 'Expired',
                                'satisfied': 'No',
                                'comments': 'IT was of no help since the drugs were expired',
                                transactions: [
                                    {
                                        'id': 4,
                                        'consignee': 'Ntolo VHT', 'received': 'Yes',
                                        'dateReceived': '22/10/2014',
                                        'quantityReceived': '35',
                                        'quality': 'Expired',
                                        'satisfied': 'No',
                                        'comments': 'They were of no use'
                                    },
                                    {
                                        'id': 5,
                                        'consignee': 'Ntindi VHT', 'received': 'Yes',
                                        'dateReceived': '22/10/2014',
                                        'quantityReceived': '50',
                                        'quality': 'Expired',
                                        'satisfied': 'No',
                                        'comments': 'I had to throw them away'
                                    },
                                    {
                                        'id': 6,
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
                                 'id': 7,
                                'consignee': 'Nyango General Hospital', 'received': 'Yes',
                                'dateReceived': '15/10/2014',
                                'quantityReceived': '372',
                                'quality': 'Good',
                                'satisfied': 'Yes',
                                'comments': 'Timely delivery',
                                transactions: [
                                    {
                                        'id': 8,
                                        'consignee': 'Thambo VHT', 'received': 'Yes',
                                        'dateReceived': '16/10/2014',
                                        'quantityReceived': '35',
                                        'quality': 'Good',
                                        'satisfied': 'Yes',
                                        'comments': 'You are helping us save lives'
                                    },
                                    {
                                        'id': 8,
                                        'consignee': 'Ntinka VHT', 'received': 'Yes',
                                        'dateReceived': '16/10/2014',
                                        'quantityReceived': '21',
                                        'quality': 'Good',
                                        'satisfied': 'Yes',
                                        'comments': 'Thank you very much'
                                    },
                                    {
                                        'id': 9,
                                        'consignee': 'Nkaka Baracks', 'received': 'Yes',
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
                },
                {
                    'ip': {
                        'id': 19,
                        'consignee': 'Kabalore DHO', 'received': 'Yes',
                        'dateReceived': '28/10/2014',
                        'quantityReceived': '670',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'Thank you'
                    }
                },
                {
                    'ip': {
                        'id': 10,
                        'consignee': 'Malaria Consortium', 'received': 'Yes',
                        'dateReceived': '12/10/2014',
                        'quantityReceived': '1500',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'Delivered'
                    },
                    'data': {
                        'id': 11,
                        'consignee': 'Mpigi', 'received': 'Yes',
                        'dateReceived': '13/10/2014',
                        'quantityReceived': '700',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': '',
                        'dayData': [
                            {
                                'id': 12,
                                'consignee': 'Mpigi VHT', 'received': 'Yes',
                                'dateReceived': '13/10/2014',
                                'quantityReceived': '250',
                                'quality': 'Good',
                                'satisfied': 'Yes',
                                'comments': 'Great!',
                                transactions: [
                                    {
                                        'id': 13,
                                        'consignee': 'Kammengo', 'received': 'Yes',
                                        'dateReceived': '14/10/2014',
                                        'quantityReceived': '40',
                                        'quality': 'Good',
                                        'satisfied': 'No',
                                        'comments': 'Some were missing'
                                    },
                                    {
                                        'id': 14,
                                        'consignee': 'Buwama', 'received': 'Yes',
                                        'dateReceived': '14/10/2014',
                                        'quantityReceived': '60',
                                        'quality': 'Good',
                                        'satisfied': 'Yes',
                                        'comments': 'Appreciate'
                                    },
                                    {
                                        'id': 15,
                                        'consignee': 'Nkozi', 'received': 'Yes',
                                        'dateReceived': '14/10/2014',
                                        'quantityReceived': '75',
                                        'quality': 'Good',
                                        'satisfied': 'No',
                                        'comments': 'Only got half what I asked for'
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    'ip': {
                        'id': 18,
                        'consignee': 'Mubende DHO', 'received': 'Yes',
                        'dateReceived': '16/10/2014',
                        'quantityReceived': '1000',
                        'quality': 'Fair',
                        'satisfied': 'No',
                        'comments': 'Boxes were badly damaged'
                    }
                },
                {
                    'ip': {
                        'id': 17,
                        'consignee': 'Mukono DHO', 'received': 'Yes',
                        'dateReceived': '11/10/2014',
                        'quantityReceived': '820',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'Received'
                    }
                },
                {
                    'ip': {
                        'id': 20,
                        'consignee': 'Napak DHO', 'received': 'Yes',
                        'dateReceived': '18/10/2014',
                        'quantityReceived': '570',
                        'quality': 'Poor',
                        'satisfied': 'No',
                        'comments': 'All expired'
                    },
                    'data': {
                        'id': 201,
                        'consignee': 'Napak VHT', 'received': 'Yes',
                        'dateReceived': '28/10/2014',
                        'quantityReceived': '220',
                        'quality': 'Poor',
                        'satisfied': 'No',
                        'comments': 'All expired!!!',
                        'dayData': [
                            {
                                'id': 202,
                                'consignee': 'Kira', 'received': 'Yes',
                                'dateReceived': '28/10/2014',
                                'quantityReceived': '220',
                                'quality': 'Poor',
                                'satisfied': 'No',
                                'comments': 'All expired!!!'
                            }
                        ]
                    }
                },
                {
                    'ip': {
                        'id': 21,
                        'consignee': 'Ntungamo DHO', 'received': 'Yes',
                        'dateReceived': '14/10/2014',
                        'quantityReceived': '180',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'Received'
                    }
                },
                {
                    'ip': {
                        'id': 22,
                        'consignee': 'Pader DHO', 'received': 'Yes',
                        'dateReceived': '21/10/2014',
                        'quantityReceived': '630',
                        'quality': 'Fair',
                        'satisfied': 'Yes',
                        'comments': 'Ok'
                    }
                },
                {
                    'ip': {
                        'id': 23,
                        'consignee': 'Wakiso DHO', 'received': 'Yes',
                        'dateReceived': '11/10/2014',
                        'quantityReceived': '1350',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': 'Good condition'
                    },
                    'data': {
                        'id': 24,
                        'consignee': 'Kira', 'received': 'Yes',
                        'dateReceived': '13/10/2014',
                        'quantityReceived': '400',
                        'quality': 'Good',
                        'satisfied': 'Yes',
                        'comments': '',
                        'dayData': [
                            {
                                'id': 25,
                                'consignee': 'Kira', 'received': 'Yes',
                                'dateReceived': '13/10/2014',
                                'quantityReceived': '400',
                                'quality': 'Good',
                                'satisfied': 'Yes',
                                'comments': 'OK'
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



