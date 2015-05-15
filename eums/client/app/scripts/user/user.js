'use strict';

angular.module('User', ['eums.config']).factory('UserService', function ($http) {
    return {
        getCurrentUser: function () {
            return $http.get('/api/current-user/').then(function (response) {
                return response.data;
            });
        },
        checkUserPermission: function (permission) {
            return $http.get('/api/permission?permission=' + permission).then(function () {
                return true;
            }).catch(function () {
                return false;
            });
        }
    };
});
