'use strict';

angular.module('NodeRun', ['eums.config', 'Item'])
    .factory('NodeRunService', function ($http, EumsConfig) {
        return {
            createNodeRun: function (nodeRunDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.NODE_RUN, nodeRunDetails).then(function (response) {
                    return response.data;
                });
            }
        };
    });


