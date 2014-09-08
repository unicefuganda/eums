angular.module('SupplyPlanService', ['ngResource'])
    .factory('SupplyPlan', function($resource) {

        var SupplyPlanResource = function() {
            return $resource('/api/supply-plan/');
        };

        return {
            all: function() {
                return new SupplyPlanResource().query().$promise
            },
            get: {},
            create: {}
        }
    });