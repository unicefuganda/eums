'use strict';

angular.module('contacts', ['eums.config'])
    .factory('ContactService', function ($http, EumsConfig) {
        return {
            addContact: function (contact) {
                return $http.post(EumsConfig.CONTACTSERVICEURL + '/add', contact);
            }
        };
    });