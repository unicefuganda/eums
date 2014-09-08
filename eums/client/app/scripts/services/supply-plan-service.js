'use strict';

angular.module('SupplyPlanService', [])
    .factory('SupplyPlan', function($http) {

        return {
            all: function() {
                return $http.get('/api/supply-plan');
            },
            get: {},
            create: {}
        };
    });