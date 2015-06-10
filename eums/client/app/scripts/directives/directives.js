'use strict';

angular.module('Directives', [])
    .directive('ordersTable', [function () {
        return {
            controller: 'WarehouseDeliveryController',
            restrict: 'E',
            scope: {
                onSelect: '&',
                actionable: '@'
            },
            templateUrl: '/static/app/views/distribution-planning/partials/view-sales-orders.html'
        };
    }]);

