'use strict';

angular.module('Programme', ['eums.config'])
    .factory('ProgrammeService', function($http, EumsConfig) {
        return {
            getProgramme: function(programmeId) {
                var getProgrammePromise = $http.get(EumsConfig.BACKEND_URLS.PROGRAMME + programmeId + '/');
                return getProgrammePromise.then(function(response) {
                    return response.data;
                });
            },
            fetchProgrammes: function(){
                return $http.get(EumsConfig.BACKEND_URLS.PROGRAMME);
            }
        };
    });