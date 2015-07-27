'use strict';

angular.module('Run', ['eums.config', 'Item'])
    .factory('RunService', function ($http, EumsConfig) {
        return {
            createRun: function (runDetails) {
                return $http.post(EumsConfig.BACKEND_URLS.RUN, runDetails).then(function (response) {
                    return response.data;
                });
            }
        };
    });


