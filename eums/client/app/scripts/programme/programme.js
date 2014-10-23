'use strict';

angular.module('Programme', ['eums.config', 'User'])
    .factory('ProgrammeService', function ($http, EumsConfig) {
        return {
            getProgrammeDetails: function(programmeId) {
                return $http.get(EumsConfig.BACKEND_URLS.PROGRAMME + programmeId + '/').then(function(response) {
                    return response.data;
                });
            },
            fetchProgrammes: function() {
                return $http.get(EumsConfig.BACKEND_URLS.PROGRAMME);
            }
        };
    });