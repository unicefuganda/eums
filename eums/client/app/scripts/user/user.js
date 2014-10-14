'use strict';

angular.module('User', ['eums.config']).factory('UserService', function ($http) {
                 return {
                     getUserByIdAsProgrammeFocal: function (userId){
                         return $http.get('/api/user/' + userId + '/').then(function(response){
                             return {
                                 id: response.data.id,
                                 firstName: response.data.first_name,
                                 lastName: response.data.last_name
                             };
                         });
                     }
                 };
             });
