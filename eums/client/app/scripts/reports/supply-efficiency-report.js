'use strict';

angular.module('SupplyEfficiencyReport', [
    'eums.config', 'ngTable', 'siTable', 'eums.ip', 'Consignee', 'Directives', 'Loader'])
    .controller('SupplyEfficiencyReportController', function ($scope, LoaderService) {
        $scope.filters = {};
        $scope.$on('filters-changed', function (_, newFilters) {
            $scope.filters = newFilters;
        })
    });
