'use strict';

angular.module('Home', ['GlobalStats', 'DistributionPlan'])
    .controller('HomeController', function ($scope, $location) {
        $scope.filter = {received: '', notDelivered: '', receivedWithIssues: '', year: ''};
        $scope.datepicker = {from: false, to: false};
        $scope.clickedMarker = '';
        $scope.allMarkers = [];
        $scope.ip = '';
        $scope.shownMarkers = [];
        $scope.programme = '';
        $scope.notDeliveredChecked = false;
        $scope.deliveredChecked = false;
        $scope.totalStats = {};
        $scope.allResponses = {};

        $scope.showDetailedResponses = function () {
            $location.path('/response-details/' + $scope.district);
        };

    }).controller('ResponseController', function ($scope, $routeParams, DistributionPlanService) {
        DistributionPlanService.orderResponsesByDate($routeParams.district).then(function (allResponses) {
            $scope.allResponses = allResponses;
        });
    });
