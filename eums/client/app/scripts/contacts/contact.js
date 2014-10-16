'use strict';

angular.module('Contact', ['eums.config'])
    .factory('ContactService', function ($http, EumsConfig) {
        return {
            addContact: function (contact) {
                return $http.post(EumsConfig.CONTACT_SERVICE_URL, contact);
            },
            getContactById: function(id) {
                return $http.get(EumsConfig.CONTACT_SERVICE_URL + id + '/').then(function(response) {
                    return response.data;
                });
            },
            getContactsBySearchQuery: function(searchString) {
                return $http.get(EumsConfig.CONTACT_SERVICE_URL + '?searchfield=' + searchString ).then(function(response) {
                    return response.data;
                });
            }
        };
    });