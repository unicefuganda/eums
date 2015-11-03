'use strict';

angular.module('SupplyEfficiencyReport', [
    'eums.config', 'ngTable', 'siTable', 'eums.ip', 'Consignee', 'Directives', 'Loader', 'SupplyEfficiencyQueries'])
    .controller('SupplyEfficiencyReportController', function ($scope, LoaderService, SupplyEfficiencyReportService) {
        var views = SupplyEfficiencyReportService.VIEWS;
        $scope.filters = {};
        $scope.$on('filters-changed', function (_, newFilters) {
            $scope.filters = newFilters;
        });
        SupplyEfficiencyReportService.generate(views.DELIVERY, $scope.filters).then(function (report) {
            $scope.report = report;
        });
    }).factory('SupplyEfficiencyReportService', function ($http, Queries, EumsConfig) {
        var VIEWS = {DELIVERY: 1};
        var url = EumsConfig.ELASTIC_SEARCH_URL + '_search?search_type=count';
        return {
            generate: function (view, filters) {
                if (view == VIEWS.DELIVERY && !Object.size(filters)) {
                    return $http.post(url, Queries.baseQuery).then(function (response) {
                        return response.data.aggregations.deliveries;
                    });
                }
            },
            VIEWS: VIEWS
        }
    });
