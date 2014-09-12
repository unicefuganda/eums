'use strict';

angular.module('SupplyPlan', [])
    .controller('SupplyPlanController', function($scope, SupplyPlanService) {
        new SupplyPlanService.all().then(function(response) {
            $scope.supplyPlans = response.data;
        });
    })
    .factory('SupplyPlanService', function($http) {
        return {
            all: function() {
                return $http.get('/api/supply-plan');
            },
            get: {},
            create: {}
        };
    });
