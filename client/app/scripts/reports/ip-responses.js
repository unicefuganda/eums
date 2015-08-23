'use strict';

angular.module('IPResponses', ['eums.config', 'ReportService'])
    .controller('IPResponsesController', function ($scope, ReportService) {

        ReportService.allIpResponses().then(function (responses) {
            $scope.responses = responses;
        });
    });
