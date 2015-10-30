'use strict';

angular.module('SupplyEfficiencyReportFilters', ['Directives', 'Item', 'Programme'])
    .controller('SupplyEfficiencyReportFiltersController', function ($scope) {
        $scope.filters = {};

        $scope.clearFilters = function () {
            $scope.$broadcast('clear-list');
            $scope.$broadcast('clear-programme');
            $scope.$broadcast('clear-item');
            $scope.$broadcast('clear-consignee');
            $scope.filters = {};
        }
    });
