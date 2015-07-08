'use strict';

angular.module('Consignee', ['eums.config', 'eums.service-factory'])
    .directive('searchConsignees', function (ConsigneeService) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, _, ngModel) {
                ConsigneeService.filterByType('implementing_partner').then(function (allIps) {
                    element.select2({
                        width: '100%',
                        query: function (query) {
                            var data = {results: []};
                            var matches = allIps.filter(function (item) {
                                return item.name.toLowerCase().indexOf(query.term.toLowerCase()) >= 0;
                            });

                            data.results = matches.map(function (match) {
                                return {id: match.id, text: match.name};
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

    .factory('Consignee', function () {
        return function (json) {
            !json && (json = {});
            Object.defineProperty(this, 'isNull', {
                get: function () {
                    return this.id === undefined || this.id === null;
                }.bind(this)
            });
            this.id = json.id || undefined;
            this.name = json.name || null;
            this.customerId = json.customerId || null;
            this.location = json.location || null;
            this.importedFromVision = json.importedFromVision || false;
            this.remarks = json.remarks || null;
        };
    })
    .
    factory('ConsigneeService', function ($http, EumsConfig, ServiceFactory, Consignee) {
        return ServiceFactory.create({
            uri: EumsConfig.BACKEND_URLS.CONSIGNEE,
            model: Consignee,
            methods: {
                getByTopLevelNode: function () {
                    return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE + '?node=top').then(function (response) {
                        return response.data;
                    });
                },
                filterByType: function (type) {
                    return $http.get(EumsConfig.BACKEND_URLS.CONSIGNEE + '?search=' + type).then(function (response) {
                        return response.data;
                    });
                }
            }
        });
    })
    .controller('ConsigneesController', function ($scope, ConsigneeService, Consignee) {
        $scope.consignees = [];
        ConsigneeService.all().then(function (consignees) {
            $scope.consignees = consignees;
        });
        $scope.addConsignee = function () {
            $scope.consignees.insert(new Consignee(), 0);
        };
        $scope.save = function (consignee) {
            ConsigneeService.create(consignee).then(function (createdConsignee) {
                consignee.id = createdConsignee.id;
            });
        };
    });