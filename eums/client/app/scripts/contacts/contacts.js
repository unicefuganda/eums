'use strict';

angular.module('Contacts', ['eums.config'])
    .factory('ContactService', function ($http, EumsConfig) {
        return {
            addContact: function (contact) {
                return $http.post(EumsConfig.CONTACT_SERVICE_URL, contact);
            },
            getContactById: function(id) {
                return $http.get(EumsConfig.CONTACT_SERVICE_URL + id + "/");
            }
        };
    });