'use strict';


angular.module('IPStockReport', ['ngTable', 'siTable', 'eums.ip'])
    .controller('IPStockReportController', function(IPService, $scope) {
        var ips = [
            {
                name: 'Naguru Teenage Information',
                id: 1,
                documents: [
                    {
                        doc_number: 23569087,
                        value_received: 7000,
                        value_dispensed: 7000
                    },
                    {
                        doc_number: 49876421,
                        value_received: 5000,
                        value_dispensed: 4080
                    },
                    {
                        doc_number: 76452982,
                        value_received: 6000,
                        value_dispensed: 2700
                    },
                    {
                        doc_number: 76548710,
                        value_received: 800,
                        value_dispensed: 790
                    }
                ]
            },
            {
                name: 'AFRINENA CHILDREN\'S VOICE',
                id: 2,
                documents: [
                    {
                        doc_number: 27650981,
                        value_received: 6000,
                        value_dispensed: 6000
                    },
                    {
                        doc_number: 66654231,
                        value_received: 29831,
                        value_dispensed: 29822
                    }
                ]
            },
            {
                name: 'UGANDA POLICE FORCES/RPC NORTH',
                id: 3,
                documents: [
                    {
                        doc_number: 36509861,
                        value_received: 4982,
                        value_dispensed: 3450
                    },
                    {
                        doc_number: 34421663,
                        value_received: 2700,
                        value_dispensed: 2700
                    },
                    {
                        doc_number: 47639821,
                        value_received: 299,
                        value_dispensed: 299
                    }
                ]
            },
            {
                name: 'KAMWOKYA CHRISTIAN CARING COMM. TLC',
                id: 4,
                documents: [
                    {
                        doc_number: 34562093,
                        value_received: 39478,
                        value_dispensed: 29830
                    }
                ]
            },
            {
                name: 'FORUM FOR AFRICAN WOMEN',
                id: 5,
                documents: [
                    {
                        doc_number: 33214432,
                        value_received: 1000,
                        value_dispensed: 1000
                    },
                    {
                        doc_number: 10098002,
                        value_received: 4870,
                        value_dispensed: 3987
                    }
                ]
            },
            {
                name: 'ADVOCATES COALITION FOR DEVELOPMENT',
                id: 6,
                documents: [
                    {
                        doc_number: 23451264,
                        value_received: 200,
                        value_dispensed: 200
                    }
                ]
            }
        ];

        $scope.ips = ips.map(function(ip) {

            var totalReceived = ip.documents.reduce(function(lastDoc, currentDoc) {
                return {value_received: lastDoc.value_received + currentDoc.value_received};
            }, {value_received: 0});

            var totalDispensed = ip.documents.reduce(function(lastDoc, currentDoc) {
                return {value_dispensed: lastDoc.value_dispensed + currentDoc.value_dispensed};
            }, {value_dispensed: 0});

            ip.totalReceived = totalReceived.value_received;
            ip.totalDispensed = totalDispensed.value_dispensed;

            return ip;
        });

        $scope.selectedIPId = undefined;

        $scope.$watch('selectedIPId', function(id) {
            $scope.selectedIP = $scope.ips.filter(function(ip) {
                return ip.id === id;
            })[0];

        });
    })
    .directive('searchFromList', function($timeout) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                var list = JSON.parse(attrs.list);

                element.select2({
                    width: '150px',
                    query: function(query) {
                        var data = {results: []};
                        var matches = list.filter(function(item) {
                            return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                        });
                        data.results = matches.map(function(match) {
                            return {
                                id: match.id,
                                text: match.name
                            };
                        });
                        query.callback(data);
                    },
                    initSelection: function(element, callback) {
                        $timeout(function() {
                            var matchingItem = list.filter(function(item) {
                                return item.id === ngModel.$modelValue;
                            })[0];
                            if(matchingItem) {
                                callback({id: matchingItem.id, text: matchingItem.name});
                            }
                        });
                    }
                });
            }
        };
    });


