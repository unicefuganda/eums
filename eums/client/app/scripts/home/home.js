'use strict';

angular.module('Home', ['GlobalStats', 'DistributionPlan'])
    .controller('HomeController', function ($rootScope, $scope, $location) {
        $scope.filter = {programme: '', ip: '', received: '', notDelivered: '', receivedWithIssues: '', year: ''};
        $scope.datepicker = {from: false, to: false};
        $scope.shownMarkers = [];
        $scope.notDeliveredChecked = false;
        $scope.deliveredChecked = false;
        $scope.totalStats = {};
        $scope.allResponses = {};
        $scope.allResponsesMap = [];
        $scope.data = {allResponsesLocationMap: []};
        $scope.isFiltered = false;

        $scope.showDetailedResponses = function () {
            $location.path('/response-details/' + $scope.district);
        };

    }).controller('ResponseController', function ($scope, $routeParams, DistributionPlanService) {
        DistributionPlanService.orderAllResponsesByDate($routeParams.district).then(function (allResponses) {
            $scope.allResponses = allResponses;
        });
    });
