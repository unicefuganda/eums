'use strict';

angular.module('Home', ['GlobalStats', 'DistributionPlan'])
    .controller('HomeController', function ($rootScope, $scope, $location, UserService) {
        $scope.filter = {programme: '', ip: '', year: ''};
        $scope.deliveryStatus = {received: true, notDelivered: true, receivedWithIssues: true};

        $scope.datepicker = {from: false, to: false};
        $scope.dateFilter = {from: '', to: ''};
        $scope.totalStats = {};
        $scope.allResponses = {};
        $scope.allResponsesFromDb = {};
        $scope.allResponsesMap = [];
        $scope.data = {topLevelResponses: [], allResponsesLocationMap: [], totalStats: {}, responses: [], district: ''};
        $scope.isFiltered = false;
        $scope.notDeliveryStatus = false;

        UserService.getCurrentUser().then(function (user){
            $scope.user = user;
        });
        $scope.showDetailedResponses = function () {
            $location.path('/response-details/' + $scope.data.district);
        };

    }).controller('ResponseController', function ($scope, $routeParams, DistributionPlanService) {
        DistributionPlanService.orderAllResponsesByDate($routeParams.district).then(function (allResponses) {
            $scope.allResponses = allResponses;
        });
    });
