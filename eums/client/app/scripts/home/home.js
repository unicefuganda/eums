'use strict';

angular.module('Home', ['GlobalStats', 'DistributionPlan'])
    .controller('HomeController', function ($rootScope, $scope, $location) {
        $scope.filter = {programme: '', ip: '', year: '', received: true, notDelivered: true, receivedWithIssues: true};
        $scope.deliveryStatus = {received: true, notDelivered: true, receivedWithIssues: true};

        $scope.datepicker = {from: false, to: false};
        $scope.totalStats = {};
        $scope.allResponses = {};
        $scope.allResponsesFromDb = {};
        $scope.allResponsesMap = [];
        $scope.data = {topLevelResponses: [], allResponsesLocationMap: [], totalStats: {}, responses: [], district: ''};
        $scope.isFiltered = false;


        $scope.showDetailedResponses = function () {
            $location.path('/response-details/' + $scope.data.district);
        };

    }).controller('ResponseController', function ($scope, $routeParams, DistributionPlanService) {
        DistributionPlanService.orderAllResponsesByDate($routeParams.district).then(function (allResponses) {
            $scope.allResponses = allResponses;
        });
    });
