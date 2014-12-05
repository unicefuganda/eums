'use strict';

angular.module('User', ['eums.config']).factory('UserService', function ($http) {
    return {
        getUserById: function (userId) {
            return $http.get('/api/user/' + userId + '/').then(function (response) {
                return {
                    id: response.data.id,
                    firstName: response.data.first_name,
                    lastName: response.data.last_name
                };
            });
        },

        getCurrentUser: function () {
            return $http.get('/api/current-user/').then(function (response) {
                return response.data;
            });
        },

        checkUserPermission: function (permission) {
            return $http.get('/api/permission?permission=' + permission).then(function () {
                return true;
            }, function () {
                return false;
            });
        }
    };
});
