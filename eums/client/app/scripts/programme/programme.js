'use strict';

angular.module('Programme', ['eums.config'])
    .factory('ProgrammeService', function($http, EumsConfig) {
        return {
            getProgrammeDetails: function(programme) {
                return $http.get(EumsConfig.BACKEND_URLS.USER + programme.focal_person + '/').then(function(response) {
                    programme.focal_person = response.data;
                    return programme;
                });
            },
            fetchProgrammes: function(){
                return $http.get(EumsConfig.BACKEND_URLS.PROGRAMME);
            }
        };
    });