'use strict';

angular.module('Home', ['GlobalStats', 'DistributionPlan'])
    .controller('HomeController', function ($scope) {
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

    });
