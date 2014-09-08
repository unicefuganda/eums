'use strict';

angular.module('mainController', ['SupplyPlanService'])
    .controller('MainCtrl', function($scope, SupplyPlan) {
        //TODO Remove these awesome things
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];
        new SupplyPlan.all().then(function(data) {
            $scope.supplyPlans = data;
        });
    });
