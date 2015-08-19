'use strict';

angular.module('Alerts', [])
    .controller('AlertsController', function ($scope) {

        $scope.alerts = [{waybill: 72082647, issue: 'Not Received'}, {waybill: 12345678, issue: 'Bad Condition'}];
    });