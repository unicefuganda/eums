'use strict';

angular.module('Consignee', ['eums.config', 'Contact'])
    .directive('searchConsignees', function (ConsigneeService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, _, ngModel) {
                ConsigneeService.getConsigneesByType('implementing_partner').then(function (allIps) {
                    element.select2({
                        width: '100%',
                        query: function (query) {
                            var data = {results: []};
                            var matches = allIps.filter(function (item) {
                                return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                            });

                            data.results = matches.map(function (match) {
                                return {
                                    id: match.id,
                                    text: match.name
                                };
                            });
                            query.callback(data);

                        }
                    });

                    element.change(function () {
                        ngModel.$setViewValue(element.select2('data').id);
                        scope.$apply();
                    });
                });
            }
        };
    })
    .factory('ConsigneeService', function ($http, EumsConfig) {
        return {
            fetchConsignees: function () {
                return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE).then(function (response) {
                    return response.data;
                });
            },
            getConsigneesByType: function (type) {
                return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE + '?search=' + type).then(function (response) {
                    return response.data;
                });
            },
            getConsigneeById: function (consigneeId) {
                return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE + consigneeId + '/').then(function (response) {
                    return { id: response.data.id, name: response.data.name};
                });
            },
            createConsignee: function (consigneeDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.CONSIGNEE, consigneeDetails).then(function (response) {
                    if (response.status === 201) {
                        return response.data;
                    }
                    else {
                        return response;
                    }
                });
            }
        };
    });


