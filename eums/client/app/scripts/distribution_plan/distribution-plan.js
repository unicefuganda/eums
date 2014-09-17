'use strict';

angular.module('DistributionPlan', ['contacts'])
    .controller('DistributionPlanController', function ($scope, ContactService, $location) {
        $scope.contact = {};
        $scope.errorMessage = '';

        $scope.addContact = function () {
            ContactService.addContact($scope.contact).then(function () {
                $location.path('/');
            }, function (error) {
                $scope.errorMessage = error.data.error;
            });
        };
    });

