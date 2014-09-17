'use strict';

angular.module('DistributionPlan', ['contacts', 'eums.config'])
    .controller('DistributionPlanController', function($scope, ContactService, $location) {
        $scope.contact = {};
        $scope.errorMessage = '';

        $scope.addContact = function() {
            ContactService.addContact($scope.contact).then(function() {
                console.log("i am here")
                $location.path('/');
            }, function(error) {
                $scope.errorMessage = error.data.error;
            });
        };
    }).factory('DistributionPlanService', function($http, EumsConfig) {
        return {
            fetchPlans: function() {
                return $http.get(EumsConfig.BACKEND_URLS.DISTRIBUTION_PLAN);
            }
        };
    });

