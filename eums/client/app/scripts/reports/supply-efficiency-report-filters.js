'use strict';

angular.module('SupplyEfficiencyReportFilters', ['Directives', 'Item', 'Programme'])
    .controller('SupplyEfficiencyReportFiltersController', function ($scope, IPService, LoaderService) {
        $scope.districts = []
    });

