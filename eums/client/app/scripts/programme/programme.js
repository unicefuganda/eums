'use strict';

angular.module('Programme', ['eums.config', 'User'])
    .factory('ProgrammeService', function($http, EumsConfig, UserService) {
        return {
            getProgrammeDetails: function(programmeId) {
                return $http.get(EumsConfig.BACKEND_URLS.PROGRAMME + programmeId + '/').then(function(response) {
                    var programme = response.data;
                    return UserService.getUserById(programme.focal_person).then(function(user) {
                        delete programme.focal_person;
                        programme.focalPerson = user;
                        return programme;
                    });
                });
            },
            fetchProgrammes: function() {
                return $http.get(EumsConfig.BACKEND_URLS.PROGRAMME);
            }
        };
    });